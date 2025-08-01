import { Router, type Request, type Response } from 'express';
import { SupabaseAuthService } from '../services/supabaseAuth.js';
import { logger } from '../lib/logger.js';
import { LoginDto, RegisterDto } from '@attendandt/shared';

const router = Router();

/**
 * POST /auth/register
 * Register a new user with Supabase Auth
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = RegisterDto.parse(req.body);
    const { email, password, firstName, lastName, role } = validatedData;

    // Register user with Supabase Auth
    const { data: user, error } = await SupabaseAuthService.register({
      email,
      password,
      firstName,
      lastName,
      role
    });

    if (error) {
      throw error;
    }

    if (!user) {
      throw new Error('User registration failed');
    }

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Immediately sign-in so we can hand tokens back to the client
    const { data: signInData, error: signInError } =
      await SupabaseAuthService.signIn(email, password);

    if (signInError || !signInData.session) {
      throw new Error('Could not create session after registration');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        tokens: {
          accessToken: signInData.session.access_token,
          refreshToken: signInData.session.refresh_token,
          expiresIn: signInData.session.expires_in
        }
      }
    });
    return;

  } catch (error: any) {
    logger.error('Registration failed', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      ip: req.ip,
    });

    // Handle specific error cases
    if (error.message.includes('already registered')) {
      res.status(409).json({
        success: false,
        error: 'A user with this email already exists',
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
    return;
  }
});

/**
 * POST /auth/login
 * Login user with Supabase Auth
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = LoginDto.parse(req.body);
    const { email, password } = validatedData;

    // Sign in with Supabase Auth
    const result = await SupabaseAuthService.signIn(email, password);

    logger.info('User logged in successfully', {
      userId: result.user?.id,
      email: result.user?.email,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        tokens: {
          accessToken: result.accessToken || '',
          refreshToken: result.refreshToken || '',
          expiresIn: 3600 // Supabase default
        }
      }
    });
    return;

  } catch (error: any) {
    logger.error('Login failed', {
      error: error.message,
      email: req.body.email,
      ip: req.ip,
    });

    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
    return;
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await SupabaseAuthService.verifyToken(token);

    res.status(200).json({
      success: true,
      data: { user }
    });
    return;

  } catch (error: any) {
    logger.error('Get user failed', {
      error: error.message,
      ip: req.ip,
    });

    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
    return;
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    const result = await SupabaseAuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: result
      }
    });
    return;

  } catch (error: any) {
    logger.error('Token refresh failed', {
      error: error.message,
      ip: req.ip,
    });

    res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    });
    return;
  }
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await SupabaseAuthService.signOut(token);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
    return;

  } catch (error: any) {
    logger.error('Logout failed', {
      error: error.message,
      ip: req.ip,
    });

    // Still return success since logout should be forgiving
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
    return;
  }
});

export default router;