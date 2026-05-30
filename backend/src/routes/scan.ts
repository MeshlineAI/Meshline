import { Router } from "express";
import { x402Gate } from "../middleware/x402";
import { fetchContractData, fetchWalletData, fetchAppData } from "../services/onchain/fetch";
import * as contractSignals from "../services/signals/contract";
import * as walletSignals from "../services/signals/wallet";
import * as appSignals from "../services/signals/app";
import { calculateScore, topSignals } from "../services/score";
import { generateReport } from "../services/ai";
import { attest, hashReport } from "../services/eas";
import { pool } from "../db";
import type { Signal, ScanType } from "../types";
import { randomUUID } from "crypto";

const router = Router();

// ── helpers ───────────────────────────────────────────────────────────────────

async function runContractSignals(data: Awaited<ReturnType<typeof fetchContractData>>): Promise<Signal[]> {
  const results = await Promise.allSettled([
    contractSignals.sourceVerification(data),
    contractSignals.proxyPattern(data),
    contractSignals.ownerPrivileges(data),
    contractSignals.deployerHistory(data),
    contractSignals.reentrancyVectors(data),
    contractSignals.honeypotDetection(data),
    contractSignals.liquidityConcentration(data),
    contractSignals.exploitSimilarity(data),
    contractSignals.cveExposure(data),
    contractSignals.githubDisclosure(data),
    contractSignals.tokenEconomics(data),
    contractSignals.ageActivity(data),
  ]);
  return results
    .map((r) =>
      r.status === "fulfilled"
        ? r.value
        : { name: "unknown", severity: "none" as const, value: null, description: "Signal failed." }
    );
}

async function runWalletSignals(data: Awaited<ReturnType<typeof fetchWalletData>>): Promise<Signal[]> {
  const results = await Promise.allSettled([
    walletSignals.approvalExposure(data),
    walletSignals.drainerInteractions(data),
    walletSignals.mevActivity(data),
    walletSignals.transactionPatterns(data),
    walletSignals.protocolFingerprint(data),
  ]);
  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { name: "unknown", severity: "none" as const, value: null, description: "Signal failed." }
  );
}

async function persistAndRespond(res: any, params: {
  target: string;
  scanType: ScanType;
  signals: Signal[];
}) {
  const { target, scanType, signals } = params;
  const { score, tier } = calculateScore(signals);
  const top = topSignals(signals);
  const id = randomUUID();
  const reportUrl = `${process.env.BASE_URL ?? "https://meshline.io"}/scan/${id}`;

  const report = await generateReport({ target, scanType, meshScore: score, tier, signals });
  const reportHash = hashReport(report);

  let easUid: string | undefined;
  try {
    easUid = await attest({ target, scanType, meshScore: score, tier, topSignals: top, reportMarkdown: report, reportUrl });
  } catch (err: any) {
    console.warn("[eas] attestation skipped:", err.message);
  }

  await pool.query(
    `INSERT INTO scans (id, target, scan_type, mesh_score, tier, report_json, report_markdown, report_hash, eas_uid, report_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, target, scanType, score, tier, JSON.stringify({ signals }), report, reportHash, easUid ?? null, reportUrl]
  );

  res.json({ id, target, scanType, meshScore: score, tier, signals, reportMarkdown: report, reportHash, easUid, reportUrl, scannedAt: Math.floor(Date.now() / 1000) });
}

// ── GET /v1/scan/contract/:address ────────────────────────────────────────────

router.get(
  "/contract/:address",
  (req, res, next) => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(req.params.address as string)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    next();
  },
  x402Gate("0.001", "Contract Intel scan"),
  async (req, res) => {
    try {
      const address = req.params.address as `0x${string}`;
      const data = await fetchContractData(address);
      const signals = await runContractSignals(data);
      await persistAndRespond(res, { target: address, scanType: "contract", signals });
    } catch (err: any) {
      console.error("[scan/contract]", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ── GET /v1/scan/wallet/:address ──────────────────────────────────────────────

router.get(
  "/wallet/:address",
  (req, res, next) => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(req.params.address as string)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    next();
  },
  x402Gate("0.001", "Wallet Intel scan"),
  async (req, res) => {
    try {
      const address = req.params.address as `0x${string}`;
      const data = await fetchWalletData(address);
      const signals = await runWalletSignals(data);
      await persistAndRespond(res, { target: address, scanType: "wallet", signals });
    } catch (err: any) {
      console.error("[scan/wallet]", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ── GET /v1/scan/app ──────────────────────────────────────────────────────────

router.get(
  "/app",
  (req, res, next) => {
    const url = req.query.url as string | undefined;
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return res.status(400).json({ error: "Invalid or missing ?url= parameter" });
    }
    next();
  },
  x402Gate("0.005", "Base App Audit"),
  async (req, res) => {
    try {
      const url = req.query.url as string;
      const data = await fetchAppData(url);
      const signals: Signal[] = [
        appSignals.tlsCheck(data),
        appSignals.securityHeaders(data),
        appSignals.apiKeyExposure(data),
        appSignals.phishingPattern(data),
        appSignals.cspPolicy(data),
      ];
      await persistAndRespond(res, { target: url, scanType: "app", signals });
    } catch (err: any) {
      console.error("[scan/app]", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ── POST /v1/batch ────────────────────────────────────────────────────────────

router.post(
  "/batch",
  x402Gate("0.0005", "Batch scan"),
  async (req, res) => {
    try {
      const { addresses } = req.body as { addresses?: string[] };
      if (!Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({ error: "Body must have non-empty addresses array" });
      }
      if (addresses.length > 50) {
        return res.status(400).json({ error: "Max 50 addresses per batch" });
      }

      const results = await Promise.allSettled(
        addresses.map(async (addr) => {
          const address = addr as `0x${string}`;
          const data = await fetchContractData(address);
          const signals = await runContractSignals(data);
          const { score, tier } = calculateScore(signals);
          return { address, meshScore: score, tier };
        })
      );

      res.json({
        results: results.map((r, i) =>
          r.status === "fulfilled"
            ? r.value
            : { address: addresses[i], error: (r as any).reason?.message ?? "failed" }
        ),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export { router as scanRouter };
