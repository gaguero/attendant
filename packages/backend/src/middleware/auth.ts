import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export type UserRole = 'ADMIN' | 'STAFF' | 'CONCIERGE' | 'USER';

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const payload = verifyToken(token);
    
    // Get user from database to ensure they still exist
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true }
    }).then(user => {
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = user;
      next();
    }).catch(error => {
      logger.error('Database error during auth', { error });
      res.status(500).json({ error: 'Authentication failed' });
    });

  } catch (error) {
    logger.warn('Token verification failed', { error });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: UserRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

// Legacy middleware names for backward compatibility
export const authMiddleware = requireAuth;
export const rbacMiddleware = requireRole; 