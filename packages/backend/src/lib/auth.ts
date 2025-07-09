import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { logger } from './logger.js';
import { JwtPayloadDto, type AuthResponseDto } from '@attendandt/shared';
import type { User } from '@prisma/client';

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days
const ACCESS_TOKEN_EXPIRES_SECONDS = 15 * 60; // 15 minutes in seconds

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set<string>();

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: User): string {
  const payload: JwtPayloadDto = {
    userId: user.id,
    email: user.email,
    role: (user.role as unknown as string).toLowerCase() as any,
  };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'attendandt-api',
    audience: 'attendandt-client',
  });

  logger.info('Access token generated', { 
    userId: user.id, 
    email: user.email,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  return token;
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(): string {
  // Generate a cryptographically secure random token
  const token = crypto.randomBytes(64).toString('hex');
  
  logger.info('Refresh token generated', { 
    tokenLength: token.length,
  });

  return token;
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: User): AuthResponseDto['tokens'] {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS,
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JwtPayloadDto {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'attendandt-api',
      audience: 'attendandt-client',
    }) as jwt.JwtPayload;

    // Validate payload structure
    const payload = JwtPayloadDto.parse(decoded);

    logger.debug('Access token verified successfully', { 
      userId: payload.userId,
      email: payload.email,
    });

    return payload;
  } catch (error) {
    logger.warn('Access token verification failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      token: token.substring(0, 20) + '...',
    });
    
    throw new Error('Invalid or expired token');
  }
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JwtPayloadDto | null {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded) return null;

    return JwtPayloadDto.parse(decoded);
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
  tokenBlacklist.add(token);
  
  logger.info('Token blacklisted', { 
    token: token.substring(0, 20) + '...',
    blacklistSize: tokenBlacklist.size,
  });
}

/**
 * Check if a token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

/**
 * Clean expired tokens from blacklist (should be called periodically)
 */
export function cleanExpiredTokens(): void {
  // For a more robust solution, store tokens with expiration times
  // and clean only actually expired tokens
  const sizeBefore = tokenBlacklist.size;
  
  // Simple cleanup: clear all tokens periodically
  // In production, implement proper token expiration tracking
  if (sizeBefore > 1000) {
    tokenBlacklist.clear();
    logger.info('Token blacklist cleared', { 
      sizeBefore,
      sizeAfter: tokenBlacklist.size,
    });
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Generate auth response for successful authentication
 */
export function generateAuthResponse(user: User): AuthResponseDto {
  const tokens = generateTokenPair(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: (user.role as unknown as string).toLowerCase() as any,
    },
    tokens,
  };
} 