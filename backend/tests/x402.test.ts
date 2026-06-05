/**
 * x402 payment gate tests.
 * Pre-exhausts the free tier quota for loopback IPs so the x402 gate activates.
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import request from "supertest";
import { app } from "../src/app";
import { pool } from "../src/db";
import { migrate } from "../src/db/migrate";

const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
// All IPs Express may report for loopback in test
const LOOPBACK_IPS = ["::1", "::ffff:127.0.0.1", "127.0.0.1"];

async function exhaustFreeTier() {
  for (const ip of LOOPBACK_IPS) {
    for (let i = 0; i < 7; i++) {
      await pool.query(
        "INSERT INTO free_scan_usage (identifier, scan_type) VALUES ($1, $2)",
        [ip, "contract"]
      );
      await pool.query(
        "INSERT INTO free_scan_usage (identifier, scan_type) VALUES ($1, $2)",
        [ip, "wallet"]
      );
      await pool.query(
        "INSERT INTO free_scan_usage (identifier, scan_type) VALUES ($1, $2)",
        [ip, "app"]
      );
    }
  }
}

async function cleanupFreeTier() {
  await pool.query(
    "DELETE FROM free_scan_usage WHERE identifier = ANY($1::text[])",
    [LOOPBACK_IPS]
  );
}

beforeAll(async () => {
  await migrate();
  await cleanupFreeTier();
  await exhaustFreeTier();
}, 30_000);

afterAll(async () => {
  await cleanupFreeTier();
});

describe("x402 gate — no payment", () => {
  it("returns 402 when TREASURY_ADDRESS is configured and no X-Payment header", async () => {
    if (!process.env.TREASURY_ADDRESS) {
      console.log("TREASURY_ADDRESS not set — x402 gate is bypassed in dev, skipping 402 check");
      return;
    }

    const res = await request(app).get(`/v1/scan/contract/${USDC}`);
    expect(res.status).toBe(402);
    expect(res.headers["x-payment-requirements"]).toBeDefined();
  });

  it("402 response includes base64-encoded payment requirements", async () => {
    if (!process.env.TREASURY_ADDRESS) return;

    const res = await request(app).get(`/v1/scan/contract/${USDC}`);
    expect(res.status).toBe(402);

    const raw = Buffer.from(res.headers["x-payment-requirements"], "base64").toString("utf-8");
    const reqs = JSON.parse(raw);

    expect(reqs.scheme).toBe("exact");
    expect(reqs.network).toBe("base-mainnet");
    expect(reqs.asset).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
    expect(reqs.payTo).toBe(process.env.TREASURY_ADDRESS);
    expect(parseInt(reqs.maxAmountRequired)).toBe(1000);
  });

  it("returns 402 with malformed X-Payment header", async () => {
    if (!process.env.TREASURY_ADDRESS) return;

    const res = await request(app)
      .get(`/v1/scan/contract/${USDC}`)
      .set("X-Payment", "not-valid-base64!!!");

    expect(res.status).toBe(402);
    expect(res.body.error).toContain("Malformed");
  });

  it("batch endpoint returns 402 with no payment", async () => {
    if (!process.env.TREASURY_ADDRESS) return;

    const res = await request(app)
      .post("/v1/scan/batch")
      .send({ addresses: [USDC] });

    expect(res.status).toBe(402);
  });
});

describe("x402 gate — price per endpoint", () => {
  it("contract scan costs 0.001 USDC (1000 atomic)", async () => {
    if (!process.env.TREASURY_ADDRESS) return;

    const res = await request(app).get(`/v1/scan/contract/${USDC}`);
    expect(res.status).toBe(402);
    const raw = Buffer.from(res.headers["x-payment-requirements"], "base64").toString();
    const reqs = JSON.parse(raw);
    expect(reqs.maxAmountRequired).toBe("1000");
  });

  it("app scan costs 0.005 USDC (5000 atomic)", async () => {
    if (!process.env.TREASURY_ADDRESS) return;

    const res = await request(app).get("/v1/scan/app?url=https://app.uniswap.org");
    expect(res.status).toBe(402);
    const raw = Buffer.from(res.headers["x-payment-requirements"], "base64").toString();
    const reqs = JSON.parse(raw);
    expect(reqs.maxAmountRequired).toBe("5000");
  });
});
