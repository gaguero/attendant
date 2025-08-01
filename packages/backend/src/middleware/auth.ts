import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '@attendandt/shared';
import { verifyAccessToken, extractTokenFromHeader } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string | null;
        lastName: string | null;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token and adds user to request
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid access token',
      });
      return;
    }

    // Verify the token
    const payload = verifyAccessToken(token);

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
      logger.warn('Authentication failed: User not found', {
        userId: payload.userId,
        email: payload.email,
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User associated with token no longer exists',
      });
      return;
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: (user.role as unknown as string).toLowerCase() as any,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
    };

    logger.debug('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    logger.warn('Authentication middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
}

/**
 * Optional authentication middleware - adds user to request if token is valid, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    // Try to verify the token
    const payload = verifyAccessToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: (user.role as unknown as string).toLowerCase() as any,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
      };

      logger.debug('Optional auth: User identified', {
        userId: user.id,
        email: user.email,
        path: req.path,
      });
    }

    next();
  } catch (error) {
    // Token is invalid, but that's okay for optional auth
    logger.debug('Optional auth: Invalid token, continuing without user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
    });
    
    next();
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('RBAC failed: No authenticated user', {
        path: req.path,
        method: req.method,
        requiredRoles: allowedRoles,
      });

      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please authenticate before accessing this resource',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('RBAC failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
      });

      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    logger.debug('RBAC check passed', {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRoles: allowedRoles,
      path: req.path,
    });

    next();
  };
}

/**
 * Admin-only access middleware
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Staff or higher access middleware
 */
export const requireStaff = requireRole(UserRole.STAFF, UserRole.ADMIN);

/**
 * Manager or higher access middleware
 */
export const requireManager = requireRole(UserRole.STAFF, UserRole.ADMIN); 