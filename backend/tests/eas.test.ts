/**
 * EAS attestation integration test.
 * Writes a REAL attestation to Base mainnet.
 *
 * Requires: BASE_RPC_URL, EAS_PRIVATE_KEY, EAS_SCHEMA_UID
 * The attester wallet needs ETH on Base for gas (~0.001 ETH is enough).
 */

import { describe, it, expect } from "bun:test";
import { attest, hashReport } from "../src/services/eas";

function requireEnv(...keys: string[]) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

describe("EAS attestation", () => {
  it("writes a scan attestation to Base and returns a UID", async () => {
    requireEnv("BASE_RPC_URL", "EAS_PRIVATE_KEY", "EAS_SCHEMA_UID");

    const reportMarkdown = "# Test Report\nThis is a test attestation from Meshline.";
    const uid = await attest({
      target: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      scanType: "contract",
      meshScore: 950,
      tier: "AAA",
      topSignals: [],
      reportMarkdown,
      reportUrl: "https://meshline.io/scan/test",
    });

    expect(typeof uid).toBe("string");
    expect(uid).toMatch(/^0x[0-9a-fA-F]{64}$/);
    console.log("[eas test] attestation UID:", uid);
  }, 60_000);

  it("hashReport produces a deterministic 0x-prefixed SHA256", () => {
    const hash1 = hashReport("hello world");
    const hash2 = hashReport("hello world");
    const hash3 = hashReport("different");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toMatch(/^0x[0-9a-f]{64}$/);
  });
});
