import { Router } from "express";
import type { NextFunction } from "express";
import { pool } from "../db";
import { generateReportPdf } from "../services/pdf";
import { getAttestTxData, getUidFromTx } from "../services/eas";
import { topSignals } from "../services/score";
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

// Backfill / link the EAS attestation UID submitted by the frontend wallet
router.post<{ uid: string }>("/:uid/attest", async (req, res, next: NextFunction) => {
  try {
    const uid = req.params.uid;
    let { easUid, txHash } = req.body;
    if (!UID_RE.test(uid)) {
      return res.status(400).json({ error: "Invalid report UID" });
    }

    if (txHash && !easUid) {
      if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
        return res.status(400).json({ error: "Invalid transaction hash" });
      }
      easUid = await getUidFromTx(txHash);
      if (!easUid) {
        return res.status(400).json({ error: "Could not retrieve attestation UID from transaction hash" });
      }
    }

    if (!easUid || !/^0x[0-9a-fA-F]{64}$/.test(easUid)) {
      return res.status(400).json({ error: "Invalid EAS attestation UID" });
    }

    const result = await pool.query(
      `UPDATE scans SET eas_uid = $1 WHERE id = $2 RETURNING id`,
      [easUid, uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ success: true, easUid });
  } catch (err) {
    next(err);
  }
});


// Public — no x402. Reports are permanently shareable, no login required.
router.get<{ uid: string }>("/:uid", async (req, res, next: NextFunction) => {
  try {
    const uid = req.params.uid;
    if (!UID_RE.test(uid)) {
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
    const scannedAt = Math.floor(new Date(row.created_at).getTime() / 1000);

    let easPayload = null;
    if (!row.eas_uid) {
      try {
        easPayload = getAttestTxData({
          target: row.target,
          scanType: row.scan_type,
          meshScore: row.mesh_score,
          tier: row.tier,
          topSignals: topSignals(row.report_json?.signals ?? []),
          reportMarkdown: row.report_markdown,
          reportUrl: row.report_url,
          scannedAt,
        });
      } catch (err) {
        console.warn("[eas] failed to generate attest payload for report:", err);
      }
    }

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
      easPayload,
      reportUrl: row.report_url,
      createdAt: row.created_at,
      scannedAt,
    });
  } catch (err) {
    next(err);
  }
});

export { router as reportRouter };

