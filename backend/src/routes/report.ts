import { Router } from "express";
import type { NextFunction } from "express";
import { pool } from "../db";
import { generateReportPdf } from "../services/pdf";
import type { RiskTier, ScanType } from "../types";

const router = Router();

const UID_RE = /^[0-9a-f-]{36}$/;

// Public PDF export of a report. No x402 — same access as the JSON report.
router.get<{ uid: string }>("/:uid/pdf", async (req, res, next: NextFunction) => {
  try {
    const uid = req.params.uid;
    if (!UID_RE.test(uid)) {
      return res.status(400).json({ error: "Invalid report UID" });
    }

    const result = await pool.query(
      `SELECT id, target, scan_type, mesh_score, tier,
              report_markdown, report_hash, eas_uid, report_url, created_at
       FROM scans WHERE id = $1`,
      [uid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const row = result.rows[0];
    const pdf = await generateReportPdf({
      id: row.id,
      target: row.target,
      scanType: row.scan_type as ScanType,
      meshScore: row.mesh_score,
      tier: row.tier as RiskTier,
      reportMarkdown: row.report_markdown ?? "",
      reportHash: row.report_hash ?? "",
      easUid: row.eas_uid,
      reportUrl: row.report_url,
      scannedAt: Math.floor(new Date(row.created_at).getTime() / 1000),
    });

    res
      .set("Content-Type", "application/pdf")
      .set("Content-Disposition", `inline; filename="meshline-${uid}.pdf"`)
      .set("Cache-Control", "public, max-age=3600")
      .send(pdf);
  } catch (err) {
    next(err);
  }
});

// Public — no x402. Reports are permanently shareable, no login required.
router.get<{ uid: string }>("/:uid", async (req, res, next: NextFunction) => {
  try {
    const uid = req.params.uid;
    if (!/^[0-9a-f-]{36}$/.test(uid)) {
      return res.status(400).json({ error: "Invalid report UID" });
    }

    const result = await pool.query(
      `SELECT id, target, scan_type, mesh_score, tier, report_json,
              report_markdown, report_hash, eas_uid, report_url, created_at
       FROM scans WHERE id = $1`,
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      target: row.target,
      scanType: row.scan_type,
      meshScore: row.mesh_score,
      tier: row.tier,
      signals: row.report_json?.signals ?? [],
      reportMarkdown: row.report_markdown,
      reportHash: row.report_hash,
      easUid: row.eas_uid,
      reportUrl: row.report_url,
      createdAt: row.created_at,
      scannedAt: Math.floor(new Date(row.created_at).getTime() / 1000),
    });
  } catch (err) {
    next(err);
  }
});

export { router as reportRouter };
