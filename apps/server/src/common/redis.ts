import { Redis, type RedisOptions } from 'ioredis';
import { logger } from './logger.js';

export interface ICacheService {
  get<T = string>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
  isRedisConnected(): boolean;
  disconnect(): Promise<void>;
}

class MemoryStore {
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

  flush(): void {
    this.store.clear();
  }
}

export class RedisCacheService implements ICacheService {
  private redisClient: Redis | null = null;
  private memoryFallback = new MemoryStore();
  private connected = false;
  private connectionAttempted = false;

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      logger.info('REDIS_URL not configured; operating with in-memory cache fallback.');
      return;
    }

    try {
      const options: RedisOptions = {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null, // Don't infinite retry during tests or local fallback
        lazyConnect: true,
      };

      this.redisClient = new Redis(redisUrl, options);

      this.redisClient.on('connect', () => {
        this.connected = true;
        logger.info('Connected to Redis server successfully.');
      });

      this.redisClient.on('error', (err: Error) => {
        if (!this.connectionAttempted) {
          logger.warn(`Redis connection unavailable (${err.message}). Using memory cache fallback.`);
        }
        this.connected = false;
      });

      // Attempt non-blocking connection
      this.redisClient.connect().then(() => {
        this.connected = true;
        this.connectionAttempted = true;
      }).catch((err: Error) => {
        this.connected = false;
        this.connectionAttempted = true;
        logger.warn(`Redis connection failed: ${err.message}. Falling back to in-memory store.`);
      });
    } catch (err: unknown) {
      this.connected = false;
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`Could not initialize Redis client (${message}); using in-memory cache.`);
    }
  }

  isRedisConnected(): boolean {
    return this.connected && this.redisClient !== null && this.redisClient.status === 'ready';
  }

  getRedisClient(): Redis | null {
    return this.isRedisConnected() ? this.redisClient : null;
  }

  async get<T = string>(key: string): Promise<T | null> {
    if (this.isRedisConnected() && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (!raw) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      } catch (err) {
        logger.warn(`Redis get error for key "${key}", falling back to memory: ${(err as Error).message}`);
      }
    }

    const raw = this.memoryFallback.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (this.isRedisConnected() && this.redisClient) {
      try {
        if (ttlSeconds > 0) {
          await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, serialized);
        }
        return;
      } catch (err) {
        logger.warn(`Redis set error for key "${key}", writing to memory: ${(err as Error).message}`);
      }
    }

    this.memoryFallback.set(key, serialized, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected() && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        logger.warn(`Redis del error for key "${key}": ${(err as Error).message}`);
      }
    }
    this.memoryFallback.del(key);
  }

  async flush(): Promise<void> {
    if (this.isRedisConnected() && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err) {
        logger.warn(`Redis flush error: ${(err as Error).message}`);
      }
    }
    this.memoryFallback.flush();
  }

  async disconnect(): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch {
        // Ignore disconnect errors
      }
      this.connected = false;
    }
  }

  // Synchronous convenience helpers for simple non-async callers
  getSync(key: string): string | null {
    return this.memoryFallback.get(key);
  }

  setSync(key: string, value: string, ttlSeconds = 3600): void {
    this.memoryFallback.set(key, value, ttlSeconds);
  }
}

export const cache = new RedisCacheService();
