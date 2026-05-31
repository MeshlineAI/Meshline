import { Router } from "express";
import type { NextFunction } from "express";
import { generateBadgeSvg } from "../services/badge";
import { pool } from "../db";
import type { RiskTier } from "../types";

const router = Router();

router.get("/:address", async (req, res, next: NextFunction) => {
  try {
    const { address } = req.params;

    // Get latest scan for this address
    const result = await pool.query(
      `SELECT mesh_score, tier, report_url FROM scans
       WHERE LOWER(target) = LOWER($1) AND scan_type = 'contract'
       ORDER BY created_at DESC LIMIT 1`,
      [address]
    );

    if (result.rows.length === 0) {
      // Return a "not scanned" badge
      const svg = generateBadgeSvg({
        score: 0,
        tier: "C",
        target: address,
        reportUrl: `https://meshline.tech/scan/new?target=${address}`,
      });
      return res
        .set("Content-Type", "image/svg+xml")
        .set("Cache-Control", "no-cache, max-age=0")
        .send(svg);
    }

    const { mesh_score, tier, report_url } = result.rows[0];
    const svg = generateBadgeSvg({
      score: mesh_score,
      tier: tier as RiskTier,
      target: address,
      reportUrl: report_url,
    });

    res
      .set("Content-Type", "image/svg+xml")
      .set("Cache-Control", "public, max-age=300")
      .send(svg);
  } catch (err) {
    next(err);
  }
});

export { router as badgeRouter };
