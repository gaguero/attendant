import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { UserRole } from '@attendandt/shared';

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
export const requireManager = requireRole(UserRole.MANAGER, UserRole.ADMIN); 