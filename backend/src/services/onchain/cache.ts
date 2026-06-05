import Redis from "ioredis";
import { config } from "../../config";

interface Entry<T> {
  value: T;
  expiresAt: number;
}

let redis: Redis | null = null;
let isRedisAvailable = false;

if (config.redis.url) {
  try {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 3) {
          isRedisAvailable = false;
          // Retry every 10 seconds to avoid spamming while preserving reconnect attempts
          return 10_000;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redis.on("connect", () => {
      console.log("Redis connected successfully.");
      isRedisAvailable = true;
    });

    redis.on("error", (err) => {
      console.error("Redis connection error:", err.message);
      isRedisAvailable = false;
    });
  } catch (err) {
    console.error("Failed to initialize Redis client:", err);
    redis = null;
    isRedisAvailable = false;
  }
}

class Cache {
  private store = new Map<string, Entry<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    if (redis && isRedisAvailable) {
      try {
        const val = await redis.get(key);
        if (val !== null) {
          return JSON.parse(val) as T;
        }
        return null;
      } catch (err) {
        console.error(`Redis GET error for key "${key}", falling back to memory:`, err);
      }
    }

    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (redis && isRedisAvailable) {
      try {
        const serialized = JSON.stringify(value);
        await redis.set(key, serialized, "PX", ttlMs);
        return;
      } catch (err) {
        console.error(`Redis SET error for key "${key}", falling back to memory:`, err);
      }
    }

    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async getOrFetch<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    await this.set(key, value, ttlMs);
    return value;
  }
}

export const cache = new Cache();

export const TTL = {
  CONTRACT_SOURCE: 24 * 60 * 60_000,  // 24h — immutable
  CONTRACT_CREATION: 24 * 60 * 60_000, // 24h — immutable
  TOKEN_HOLDERS: 60 * 60_000,          // 1h — slow-moving
  TRANSACTIONS: 5 * 60_000,            // 5min — fast-moving
  WALLET: 2 * 60_000,                  // 2min — live
} as const;

