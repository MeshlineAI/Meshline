/**
 * EAS attestation tests.
 *
 * The live attestation test writes a REAL transaction to Base mainnet and costs
 * gas every run — it is OPT-IN via RUN_EAS_LIVE_TEST=1 so it never runs in CI
 * or normal local runs (which would silently drain the attester wallet).
 *
 * To run it manually (with a funded EAS_PRIVATE_KEY):
 *   RUN_EAS_LIVE_TEST=1 bun test tests/eas.test.ts
 */

import { describe, it, expect } from "bun:test";
import { attest, hashReport, getAttestTxData } from "../src/services/eas";

const runLive = process.env.RUN_EAS_LIVE_TEST === "1";

describe("EAS attestation", () => {
  it.if(runLive)("writes a scan attestation to Base and returns a UID (live, opt-in)", async () => {
    const reportMarkdown = "# Test Report\nThis is a test attestation from Meshline.";
    const uid = await attest({
      target: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      scanType: "contract",
      meshScore: 950,
      tier: "AAA",
      topSignals: [],
      reportMarkdown,
      reportUrl: "https://meshline.tech/scan/test",
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

  it("getAttestTxData produces valid transaction payload", () => {
    const payload = getAttestTxData({
      target: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      scanType: "contract",
      meshScore: 950,
      tier: "AAA",
      topSignals: [],
      reportMarkdown: "# Test Report\nThis is a test attestation from Meshline.",
      reportUrl: "https://meshline.tech/scan/test",
      scannedAt: 1717584000,
    });

    expect(payload.to).toBeDefined();
    expect(payload.to).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(payload.data).toBeDefined();
    expect(payload.data).toMatch(/^0x[0-9a-fA-F]+/);
  });
});

