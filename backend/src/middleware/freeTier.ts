import type { Request, Response, NextFunction, RequestHandler } from "express";
import { pool } from "../db";

const FREE_LIMIT = 3;

function clientIdentifier(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) ??
    req.ip ??
    "unknown";
  return ip.trim();
}

async function usedThisMonth(identifier: string, scanType: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM free_scan_usage
     WHERE identifier = $1 AND scan_type = $2 AND scanned_at >= $3`,
    [identifier, scanType, startOfMonth]
  );
  return parseInt(result.rows[0].count, 10);
}

async function recordUsage(identifier: string, scanType: string): Promise<void> {
  await pool.query(
    `INSERT INTO free_scan_usage (identifier, scan_type) VALUES ($1, $2)`,
    [identifier, scanType]
  );
}

/**
 * Allows FREE_LIMIT free scans per IP per calendar month for the given
 * scanType, then falls through to the provided paid middleware (x402Gate).
 */
export function freeTierGate(scanType: string, paidGate: RequestHandler): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = clientIdentifier(req);
      const used = await usedThisMonth(id, scanType);

      if (used < FREE_LIMIT) {
        await recordUsage(id, scanType);
        res.setHeader("X-Free-Scans-Remaining", String(FREE_LIMIT - used - 1));
        next();
        return;
      }

      // Free quota exhausted — hand off to x402
      paidGate(req, res, next);
    } catch (err) {
      // DB error — fail open in dev, fail closed in prod
      if (process.env.NODE_ENV === "development") {
        next();
      } else {
        next(err);
      }
    }
  };
}
