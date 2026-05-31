import { Router } from "express";
import { pool } from "../db";

const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
  } catch (err: any) {
    return res.status(503).json({
      status: "degraded",
      db: "unreachable",
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    status: "ok",
    db: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  });
});

export { healthRouter };
