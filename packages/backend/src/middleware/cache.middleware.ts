import type { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service.js';

interface CacheOptions {
  ttl: number; // minutes
  keyGenerator?: (req: Request) => string | null;
  condition?: (req: Request) => boolean;
  skipUserId?: boolean;
}

export const cacheMiddleware = (options: CacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if condition is not met
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Generate cache key
    let cacheKey: string | null;
    if (options.keyGenerator) {
      cacheKey = options.keyGenerator(req);
      if (!cacheKey) {
        return next(); // Skip caching if key generator returns null
      }
    } else {
      const userId = options.skipUserId ? '' : (req.user?.id || 'anonymous');
      cacheKey = `${req.method}:${req.originalUrl}:${userId}`;
    }

    // Try to get cached response
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true, cacheHit: true });
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data: any) {
      if (res.statusCode === 200 && !data.error) {
        // Don't cache the 'cached' flag itself
        const dataToCache = { ...data };
        delete dataToCache.cached;
        delete dataToCache.cacheHit;
        
        cacheService.set(cacheKey!, dataToCache, options.ttl);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// Specific cache configurations for different endpoints
export const dashboardCache = cacheMiddleware({
  ttl: 2, // 2 minutes
  keyGenerator: (req) => req.user?.id ? `dashboard:${req.user.id}` : null,
  condition: (req) => req.method === 'GET'
});

export const profileCache = cacheMiddleware({
  ttl: 10, // 10 minutes
  keyGenerator: (req) => req.user?.id ? `profile:${req.user.id}` : null,
  condition: (req) => req.method === 'GET'
});

export const guestListCache = cacheMiddleware({
  ttl: 5, // 5 minutes
  keyGenerator: (req) => {
    if (!req.user?.id) return null;
    
    const { page = 1, search, sortBy, sortOrder } = req.query;
    
    // Don't cache search results
    if (search) return null;
    
    return `guests:${req.user.id}:page:${page}:sort:${sortBy || 'createdAt'}:${sortOrder || 'desc'}`;
  },
  condition: (req) => req.method === 'GET'
});

export const vendorsListCache = cacheMiddleware({
  ttl: 15, // 15 minutes (vendors change less frequently)
  keyGenerator: (req) => {
    if (!req.user?.id) return null;
    
    const { page = 1, category, search } = req.query;
    
    // Don't cache search results
    if (search) return null;
    
    return `vendors:${req.user.id}:page:${page}:category:${category || 'all'}`;
  },
  condition: (req) => req.method === 'GET'
});

export const usersListCache = cacheMiddleware({
  ttl: 5, // 5 minutes
  keyGenerator: (req) => {
    if (!req.user?.id) return null;
    
    const { page = 1, role, search } = req.query;
    
    // Don't cache search results
    if (search) return null;
    
    return `users:${req.user.id}:page:${page}:role:${role || 'all'}`;
  },
  condition: (req) => req.method === 'GET'
});

// Cache invalidation helpers
export const invalidateUserCache = (userId: string) => {
  cacheService.invalidateByPrefix(`profile:${userId}`);
  cacheService.invalidateByPrefix(`dashboard:${userId}`);
};

export const invalidateGuestsCache = (userId?: string) => {
  if (userId) {
    cacheService.invalidateByPrefix(`guests:${userId}`);
    cacheService.invalidateByPrefix(`dashboard:${userId}`);
  } else {
    cacheService.invalidate('guests:');
    cacheService.invalidate('dashboard:');
  }
};

export const invalidateVendorsCache = (userId?: string) => {
  if (userId) {
    cacheService.invalidateByPrefix(`vendors:${userId}`);
  } else {
    cacheService.invalidate('vendors:');
  }
};

export const invalidateUsersCache = (userId?: string) => {
  if (userId) {
    cacheService.invalidateByPrefix(`users:${userId}`);
  } else {
    cacheService.invalidate('users:');
  }
};

// Cache stats endpoint for monitoring
export const getCacheStats = () => {
  return cacheService.getStats();
};

export const getCacheHealth = () => {
  return cacheService.getHealth();
};