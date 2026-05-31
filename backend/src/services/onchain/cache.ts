interface Entry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async getOrFetch<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    this.set(key, value, ttlMs);
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
