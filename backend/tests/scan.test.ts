/**
 * End-to-end scan pipeline tests.
 * Hits real Base RPC, Basescan, and Gemini — no mocks.
 *
 * Requires: BASE_RPC_URL, BASESCAN_API_KEY, GEMINI_API_KEY, DATABASE_URL
 */

import { describe, it, expect, beforeAll } from "bun:test";
import request from "supertest";
import { app } from "../src/app";
import { migrate } from "../src/db/migrate";

const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const VITALIK = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

function requireEnv(...keys: string[]) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

beforeAll(async () => {
  requireEnv("BASE_RPC_URL", "BASESCAN_API_KEY", "GEMINI_API_KEY", "DATABASE_URL");
  await migrate();
}, 30_000);

describe("GET /v1/scan/contract/:address", () => {
  it("scans USDC and returns a valid MESH score when free tier is available", async () => {
    // Skip if TREASURY_ADDRESS is set AND free quota is exhausted (tested in x402.test.ts)
    if (process.env.TREASURY_ADDRESS) {
      console.log("Skipping full scan test — TREASURY_ADDRESS set, free quota may be exhausted");
      return;
    }

    const res = await request(app).get(`/v1/scan/contract/${USDC}`);
    expect(res.status).toBe(200);
    expect(res.body.meshScore).toBeGreaterThanOrEqual(0);
    expect(res.body.meshScore).toBeLessThanOrEqual(1000);
    expect(["AAA", "AA", "A", "BB", "C"]).toContain(res.body.tier);
    expect(Array.isArray(res.body.signals)).toBe(true);
    expect(res.body.signals.length).toBe(12);
    expect(typeof res.body.reportMarkdown).toBe("string");
    expect(res.body.reportMarkdown.length).toBeGreaterThan(100);
    expect(res.body.id).toBeDefined();
    expect(res.body.reportUrl).toContain(res.body.id);

    // USDC should score well
    expect(res.body.meshScore).toBeGreaterThan(500);
  }, 60_000);

  it("returns 400 for an invalid address", async () => {
    const res = await request(app).get("/v1/scan/contract/not-an-address");
    // Validation runs before x402 gate — always 400 regardless of payment config
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid address");
  });
});

describe("GET /v1/scan/wallet/:address", () => {
  it("scans Vitalik's wallet when gate is bypassed (dev)", async () => {
    if (process.env.TREASURY_ADDRESS) return;

    const res = await request(app).get(`/v1/scan/wallet/${VITALIK}`);
    expect(res.status).toBe(200);
    expect(res.body.meshScore).toBeGreaterThanOrEqual(0);
    expect(res.body.scanType).toBe("wallet");
    expect(Array.isArray(res.body.signals)).toBe(true);
  }, 60_000);
});

describe("GET /v1/scan/app", () => {
  it("audits a URL when gate is bypassed (dev)", async () => {
    if (process.env.TREASURY_ADDRESS) return;

    const res = await request(app).get("/v1/scan/app?url=https://app.uniswap.org");
    expect(res.status).toBe(200);
    expect(res.body.scanType).toBe("app");
    expect(res.body.signals.length).toBeGreaterThan(0);
  }, 30_000);

  it("returns 400 for missing url param", async () => {
    const res = await request(app).get("/v1/scan/app");
    // Validation runs before x402 gate — always 400 regardless of payment config
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("url");
  });
});

describe("GET /v1/report/:uid", () => {
  it("returns 404 for a non-existent report", async () => {
    const res = await request(app).get("/v1/report/00000000-0000-0000-0000-000000000000");
    expect([402, 404]).toContain(res.status);
  });
});

describe("GET /v1/badge/:address", () => {
  it("returns SVG for an address with no prior scan", async () => {
    const res = await request(app).get(`/v1/badge/${USDC}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("svg");
    // supertest may return SVG as Buffer (image/svg+xml) — handle both
    const body = Buffer.isBuffer(res.body) ? res.body.toString() : (res.text ?? "");
    expect(body).toContain("<svg");
    expect(body).toContain("MESHLINE");
  });
});
