import { logger } from './logger.js';

/**
 * In-Memory Redis Cache & Key-Value interface
 * Supports active daily plan caching and fallback memory cache.
 */

class MemoryCache {
  private store = new Map<string, { value: string; expiresAt: number }>();

  set(key: string, value: string, ttlSeconds = 3600): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): string | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  del(key: string): void {
    this.store.delete(key);
  }
}

export const cache = new MemoryCache();
logger.info('Redis / Memory cache initialized for active daily plans.');
