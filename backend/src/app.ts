import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { config } from "./config";
import { healthRouter } from "./routes/health";
import { scanRouter } from "./routes/scan";
import { reportRouter } from "./routes/report";
import { badgeRouter } from "./routes/badge";

const app = express();

// Render sits behind exactly one proxy hop — required for correct req.ip
app.set("trust proxy", 1);

const ALLOWED_ORIGINS = [
  ...config.cors.origins,
  "https://meshline.tech",
  "https://meshline.io",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or curl requests with no origin header
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
        if (allowed === origin) return true;
        if (allowed.includes("*")) {
          const regex = new RegExp("^" + allowed.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
          return regex.test(origin);
        }
        return false;
      });

      const isVercelPreview = /\.vercel\.app$/.test(origin);

      if (isAllowed || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Request origin blocked: "${origin}"`);
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "X-Payment"],
    exposedHeaders: ["X-Payment-Requirements", "X-Free-Scans-Remaining"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "1mb" }));

// Global rate limit — protects RPC / Basescan / Gemini / gas wallet from abuse
const globalLimiter = rateLimit({
  windowMs: 5 * 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, slow down" },
});

// Tighter limit on the expensive scan routes
const scanLimiter = rateLimit({
  windowMs: 5 * 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Scan rate limit exceeded, try again shortly" },
});

app.use(globalLimiter);

app.use("/health", healthRouter);
app.use("/v1/scan", scanLimiter, scanRouter);
app.use("/v1/report", reportRouter);
app.use("/v1/badge", badgeRouter);

// Final error handler — logs internally, returns generic JSON (no leak in prod)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[unhandled]", err);
  if (res.headersSent) return;
  res.status(err.status ?? 500).json({
    error: "Internal error",
    ...(config.nodeEnv !== "production" ? { detail: err?.message } : {}),
  });
});

export { app };
