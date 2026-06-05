/**
 * PDF report export tests.
 * generateReportPdf is pure (no network); the route tests hit the DB-backed app.
 */

import { describe, it, expect } from "bun:test";
import request from "supertest";
import { app } from "../src/app";
import { generateReportPdf } from "../src/services/pdf";

const sampleScan = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  target: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  scanType: "contract" as const,
  meshScore: 924,
  tier: "AAA" as const,
  reportMarkdown:
    "# Security Report\n\n## Executive Summary\nThis is a **verified** contract with no active exploit signals.\n\n## Key Findings\n- Source code is verified\n- No owner mint/drain functions\n\n## Verdict\nSafe to interact.",
  reportHash: "0xabc123",
  easUid: null,
  reportUrl: "https://meshline.tech/scan/550e8400-e29b-41d4-a716-446655440000",
  scannedAt: 1748600000,
};

describe("generateReportPdf", () => {
  it("produces a valid PDF buffer", async () => {
    const pdf = await generateReportPdf(sampleScan);
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(500);
    // PDF files start with the magic bytes "%PDF"
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("handles an attested scan (non-null easUid)", async () => {
    const pdf = await generateReportPdf({ ...sampleScan, easUid: "0xdeadbeef" });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("handles an empty report body without throwing", async () => {
    const pdf = await generateReportPdf({ ...sampleScan, reportMarkdown: "" });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });
});

describe("GET /v1/report/:uid/pdf", () => {
  it("returns 400 for an invalid UID", async () => {
    const res = await request(app).get("/v1/report/not-a-uid/pdf");
    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent report", async () => {
    const res = await request(app).get(
      "/v1/report/00000000-0000-0000-0000-000000000000/pdf"
    );
    expect(res.status).toBe(404);
  });
});
