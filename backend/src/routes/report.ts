import { Router } from "express";
import type { NextFunction } from "express";
import { pool } from "../db";

const router = Router();

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
