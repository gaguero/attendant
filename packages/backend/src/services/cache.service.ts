interface CacheItem<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
}

export interface CacheStats {
  size: number;
  hitRate: number;
  hits: number;
  misses: number;
  evictions: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export class ProductionCacheService {
  private cache = new Map<string, CacheItem<any>>();
  private stats = { hits: 0, misses: 0, evictions: 0 };
  private maxSize = parseInt(process.env.CACHE_MAX_SIZE || '1000');
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired items every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    
    // Graceful shutdown cleanup
    process.on('SIGTERM', () => this.destroy());
    process.on('SIGINT', () => this.destroy());
  }

  set<T>(key: string, data: T, ttlMinutes = 5): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now(),
      accessCount: 0
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    item.accessCount++;
    this.stats.hits++;
    return item.data;
  }

  invalidate(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  invalidateByPrefix(prefix: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.startsWith(prefix));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
    
    const toEvict = Math.floor(entries.length * 0.1) || 1; // Evict at least 1 item
    for (let i = 0; i < toEvict; i++) {
      if (entries[i] && entries[i][0]) {
        this.cache.delete(entries[i][0]);
        this.stats.evictions++;
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100),
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      memoryUsage: process.memoryUsage()
    };
  }

  // Get cache status for health checks
  getHealth(): { status: 'healthy' | 'warning' | 'error'; details: any } {
    const stats = this.getStats();
    const memoryUsageMB = stats.memoryUsage.heapUsed / 1024 / 1024;
    
    if (memoryUsageMB > 512) {
      return {
        status: 'warning',
        details: { message: 'High memory usage', memoryUsageMB, stats }
      };
    }
    
    if (stats.hitRate < 50 && stats.hits + stats.misses > 100) {
      return {
        status: 'warning',
        details: { message: 'Low cache hit rate', hitRate: stats.hitRate, stats }
      };
    }
    
    return {
      status: 'healthy',
      details: stats
    };
  }
}

// Singleton instance
export const cacheService = new ProductionCacheService();