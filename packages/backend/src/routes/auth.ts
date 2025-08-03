import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { hashPassword, comparePassword, generateToken, verifyToken, extractTokenFromHeader, blacklistToken } from '../lib/auth.js';
import { 
  RegisterDto, 
  LoginDto, 
  RefreshTokenDto, 
  ChangePasswordDto, 
  ForgotPasswordDto, 
  ResetPasswordDto 
} from '@attendandt/shared';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../lib/mailer.js';
import bcrypt from 'bcrypt';

const router: Router = Router();

// Password hashing rounds
const SALT_ROUNDS = 12;

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = RegisterDto.parse(req.body);
    const { email, password, firstName, lastName, role } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      logger.warn('Registration failed: User already exists', {
        email: email.toLowerCase(),
        ip: req.ip,
      });

      res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email address already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        role,
        passwordHash: hashedPassword,
      },
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip,
    });

    // Generate auth response
    const authResponse = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: authResponse,
    });
  } catch (error) {
    logger.error('Registration error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body,
      ip: req.ip,
    });

    if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to register user',
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = LoginDto.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      logger.warn('Login failed: User not found or no password set', {
        email: email.toLowerCase(),
        ip: req.ip,
      });

      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
      return;
    }

    // Verify password (using passwordHash as temporary password storage)
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn('Login failed: Invalid password', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });

      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
      return;
    }

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip,
    });

    // Generate auth response
    const authResponse = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: authResponse,
    });
  } catch (error) {
    logger.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body,
      ip: req.ip,
    });

    if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to login',
    });
  }
});

/**
 * POST /auth/forgot-password
 * Request a password reset
 */
router.post(
  '/forgot-password',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = ForgotPasswordDto.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token,
            expiresAt,
          },
        });

        // Send the password reset email
        await sendPasswordResetEmail(user.email, token);

        logger.info(`Password reset email sent to ${user.email}`);
      } else {
        // To prevent user enumeration, we don't reveal if the user was found or not.
        // We log it for our records, but send a generic success response.
        logger.info(
          `Password reset requested for non-existent user: ${email}`
        );
      }

      // Always send a success response to prevent email enumeration
      res.status(200).json({
        success: true,
        message:
          'If an account with this email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Forgot password error', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/reset-password
 * Reset user password using a token
 */
router.post(
  '/reset-password',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = ResetPasswordDto.parse(req.body);

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token, used: false, expiresAt: { gte: new Date() } },
      });

      if (!resetToken) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired token',
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash: hashedPassword },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        }),
      ]);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    } catch (error) {
      logger.error('Reset password error', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = RefreshTokenDto.parse(req.body);
    const { refreshToken: _refreshToken } = validatedData;

    // In a real implementation, you would:
    // 1. Store refresh tokens in database with expiration
    // 2. Validate the refresh token
    // 3. Check if it's not revoked
    // For now, we'll return an error since we haven't implemented refresh token storage

    logger.warn('Refresh token endpoint called but not fully implemented', {
      ip: req.ip,
    });

    res.status(501).json({
      success: false,
      error: 'Not implemented',
      message: 'Refresh token functionality not yet implemented',
    });
  } catch (error) {
    logger.error('Refresh token error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
    });

    res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Invalid refresh token',
    });
  }
});

/**
 * POST /auth/logout
 * Logout user by blacklisting their token
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        // Try to blacklist the token (may fail if token is invalid, but that's ok)
        blacklistToken(token);
        
        // Try to get user info for logging (may fail if token is expired)
        const payload = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true }
        });
        
        logger.info('User logged out successfully', {
          userId: user?.id,
          email: user?.email,
          ip: req.ip,
        });
      } catch (tokenError) {
        // Token verification failed, but we still want to allow logout
        logger.info('Logout with invalid/expired token', {
          ip: req.ip,
          tokenError: tokenError instanceof Error ? tokenError.message : 'Unknown token error'
        });
      }
    } else {
      logger.info('Logout without token', { ip: req.ip });
    }

    // Always return success for logout - it should be forgiving
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
    });

    // Still return success since logout should always work
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
});

/**
 * POST /auth/change-password
 * Change user password
 */
router.post('/change-password', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = ChangePasswordDto.parse(req.body);
    const { currentPassword, newPassword } = validatedData;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User not authenticated',
      });
      return;
    }

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.passwordHash) {
      res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found or no password set',
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      logger.warn('Password change failed: Invalid current password', {
        userId: user.id,
        ip: req.ip,
      });

      res.status(401).json({
        success: false,
        error: 'Invalid current password',
        message: 'Current password is incorrect',
      });
      return;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedNewPassword },
    });

    logger.info('Password changed successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      ip: req.ip,
    });

    if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to change password',
    });
  }
});

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User not authenticated',
      });
      return;
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get current user error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      ip: req.ip,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get user profile',
    });
  }
});

export default router; 