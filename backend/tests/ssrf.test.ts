/**
 * SSRF guard unit tests — pure logic, no network.
 */

import { describe, it, expect } from "bun:test";
import { isBlockedIp, assertSafeUrl } from "../src/services/onchain/ssrfGuard";

describe("isBlockedIp", () => {
  it("blocks loopback", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
    expect(isBlockedIp("127.255.255.254")).toBe(true);
    expect(isBlockedIp("::1")).toBe(true);
  });

  it("blocks RFC-1918 private ranges", () => {
    expect(isBlockedIp("10.0.0.1")).toBe(true);
    expect(isBlockedIp("172.16.0.1")).toBe(true);
    expect(isBlockedIp("172.31.255.255")).toBe(true);
    expect(isBlockedIp("192.168.1.1")).toBe(true);
  });

  it("blocks cloud metadata + link-local", () => {
    expect(isBlockedIp("169.254.169.254")).toBe(true);
    expect(isBlockedIp("169.254.0.1")).toBe(true);
  });

  it("blocks IPv4-mapped IPv6 loopback", () => {
    expect(isBlockedIp("::ffff:127.0.0.1")).toBe(true);
  });

  it("blocks IPv6 unique-local + link-local", () => {
    expect(isBlockedIp("fe80::1")).toBe(true);
    expect(isBlockedIp("fc00::1")).toBe(true);
    expect(isBlockedIp("fd12:3456::1")).toBe(true);
  });

  it("allows public IPs", () => {
    expect(isBlockedIp("8.8.8.8")).toBe(false);
    expect(isBlockedIp("1.1.1.1")).toBe(false);
    expect(isBlockedIp("104.16.0.1")).toBe(false);
  });
});

describe("assertSafeUrl", () => {
  it("rejects non-http(s) schemes", async () => {
    await expect(assertSafeUrl("file:///etc/passwd")).rejects.toThrow();
    await expect(assertSafeUrl("ftp://example.com")).rejects.toThrow();
  });

  it("rejects literal private IPs", async () => {
    await expect(assertSafeUrl("http://127.0.0.1/admin")).rejects.toThrow();
    await expect(assertSafeUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow();
    await expect(assertSafeUrl("http://192.168.0.1")).rejects.toThrow();
  });

  it("rejects malformed URLs", async () => {
    await expect(assertSafeUrl("not a url")).rejects.toThrow();
  });

  it("allows a public https URL", async () => {
    const ip = await assertSafeUrl("https://example.com");
    expect(typeof ip).toBe("string");
  });
});
