import { describe, it, expect } from "bun:test";
import request from "supertest";
import { app } from "../src/app";

describe("GET /health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  it("returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.body.status).toBe("ok");
  });

  it("returns a timestamp", async () => {
    const res = await request(app).get("/health");
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});
