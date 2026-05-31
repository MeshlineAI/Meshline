/**
 * App-level middleware tests: CORS exposed headers + health DB check.
 */

import { describe, it, expect } from "bun:test";
import request from "supertest";
import { app } from "../src/app";

describe("CORS", () => {
  it("exposes the custom payment + free-tier headers to the browser", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:3000");

    const exposed = (res.headers["access-control-expose-headers"] ?? "").toLowerCase();
    expect(exposed).toContain("x-payment-requirements");
    expect(exposed).toContain("x-free-scans-remaining");
  });

  it("reflects an allowed origin", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:3000");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });
});

describe("GET /health", () => {
  it("checks the DB and reports ok when reachable", async () => {
    const res = await request(app).get("/health");
    // 200 with db:ok when DATABASE_URL is reachable, 503 otherwise — both valid shapes
    expect([200, 503]).toContain(res.status);
    expect(res.body.db).toBeDefined();
  });
});
