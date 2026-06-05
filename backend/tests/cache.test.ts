import { describe, it, expect } from "bun:test";
import { cache } from "../src/services/onchain/cache";

describe("Cache Service", () => {
  it("should cache values correctly", async () => {
    let callCount = 0;
    const fetchFn = async () => {
      callCount++;
      return { count: callCount, msg: "hello" };
    };

    const key = `test:key:${Date.now()}`;

    // First call should invoke fetchFn
    const val1 = await cache.getOrFetch(key, 10_000, fetchFn);
    expect(val1).toEqual({ count: 1, msg: "hello" });
    expect(callCount).toBe(1);

    // Second call within TTL should return cached value
    const val2 = await cache.getOrFetch(key, 10_000, fetchFn);
    expect(val2).toEqual({ count: 1, msg: "hello" });
    expect(callCount).toBe(1);
  });

  it("should respect TTL expiration", async () => {
    let callCount = 0;
    const fetchFn = async () => {
      callCount++;
      return `val-${callCount}`;
    };

    const key = `test:ttl:${Date.now()}`;

    // Set with a very short TTL (1ms)
    await cache.getOrFetch(key, 1, fetchFn);
    expect(callCount).toBe(1);

    // Wait 5ms
    await new Promise((resolve) => setTimeout(resolve, 5));

    // Next call should invoke fetchFn again
    const val2 = await cache.getOrFetch(key, 10_000, fetchFn);
    expect(val2).toBe("val-2");
    expect(callCount).toBe(2);
  });
});
