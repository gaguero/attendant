import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './prisma.js';
import { logger } from './logger.js';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): AuthResponse {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  const expiresIn = 24 * 60 * 60; // 24 hours in seconds

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn,
    },
  };
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  return parts[1] || null;
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): any | null {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded) return null;

    return decoded;
  } catch (error) {
    logger.warn('Token decode failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Blacklist a token (logout)
 */
export function blacklistToken(token: string): void {
  // In-memory token blacklist (in production, use Redis)
  // This function is no longer used in the new generateToken/verifyToken flow
  // but keeping it for now as it was part of the original file.
  // In a real application, you would manage the blacklist in a persistent store.
  logger.warn('BlacklistToken is deprecated and no longer used in the new auth flow.');
}

/**
 * Check if a token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  // In-memory token blacklist (in production, use Redis)
  // This function is no longer used in the new generateToken/verifyToken flow
  // but keeping it for now as it was part of the original file.
  // In a real application, you would manage the blacklist in a persistent store.
  logger.warn('isTokenBlacklisted is deprecated and no longer used in the new auth flow.');
  return false; // Always return false as it's not managed
}

/**
 * Clean expired tokens from blacklist (should be called periodically)
 */
export function cleanExpiredTokens(): void {
  // For a more robust solution, store tokens with expiration times
  // and clean only actually expired tokens
  const sizeBefore = 0; // No in-memory blacklist, so size is 0
  
  // Simple cleanup: clear all tokens periodically
  // In production, implement proper token expiration tracking
  if (sizeBefore > 0) { // This condition will always be false
    logger.info('Token blacklist cleared (no in-memory blacklist)');
  }
}

/**
 * Generate auth response for successful authentication
 */
export function generateAuthResponse(user: User): AuthResponse {
  return generateToken(user);
} 