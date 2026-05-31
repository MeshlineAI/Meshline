import { lookup } from "dns/promises";
import { isIP } from "net";

/**
 * Returns true if an IP address is private, loopback, link-local, or otherwise
 * not safe to fetch server-side (SSRF protection).
 */
export function isBlockedIp(ip: string): boolean {
  // Normalize IPv4-mapped IPv6 (::ffff:127.0.0.1 → 127.0.0.1)
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) ip = mapped[1];

  const v = isIP(ip);

  if (v === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 0) return true;                       // 0.0.0.0/8
    if (a === 10) return true;                      // 10.0.0.0/8 private
    if (a === 127) return true;                     // 127.0.0.0/8 loopback
    if (a === 169 && b === 254) return true;        // 169.254.0.0/16 link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true;        // 192.168.0.0/16 private
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a >= 224) return true;                      // multicast + reserved
    return false;
  }

  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;               // loopback
    if (lower === "::") return true;                // unspecified
    if (lower.startsWith("fe80")) return true;      // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local fc00::/7
    return false;
  }

  // Not a literal IP — caller should resolve first
  return false;
}

/**
 * Validates a URL is safe to fetch server-side:
 *  - http/https scheme only
 *  - host resolves to a public (non-private) IP
 *
 * Returns the resolved IP on success, throws on a blocked target.
 */
export async function assertSafeUrl(rawUrl: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw Object.assign(new Error("Invalid URL"), { status: 400 });
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw Object.assign(new Error("Only http/https URLs are allowed"), { status: 400 });
  }

  const host = url.hostname;

  // If the host is a literal IP, check it directly
  if (isIP(host)) {
    if (isBlockedIp(host)) {
      throw Object.assign(new Error("Refusing to fetch private/loopback address"), { status: 400 });
    }
    return host;
  }

  // Resolve DNS and reject if it points anywhere private
  let resolved;
  try {
    resolved = await lookup(host, { all: true });
  } catch {
    throw Object.assign(new Error("Could not resolve host"), { status: 400 });
  }

  for (const { address } of resolved) {
    if (isBlockedIp(address)) {
      throw Object.assign(new Error("Host resolves to a private/loopback address"), { status: 400 });
    }
  }

  return resolved[0]?.address ?? host;
}
