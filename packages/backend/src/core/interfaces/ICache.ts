/**
 * Cache interface for dependency injection
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  setex<T>(key: string, ttlSeconds: number, value: T): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  flush(): Promise<void>
}