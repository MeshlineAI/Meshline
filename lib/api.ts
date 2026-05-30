// Typed REST client for the Meshline backend (frontend-integration.md).
// The backend is a plain REST API — no tRPC. Free tier covers all UI dev.

import type { Severity } from "./scoring";
import { decodeRequirements, type PaymentRequirements } from "./x402";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://meshline-backend-latest.onrender.com";

export type ScanType = "contract" | "wallet" | "app";

export interface Signal {
  name: string;
  severity: Severity | string;
  value?: boolean | number | string | null;
  description: string;
}

export interface ScanResult {
  id: string;
  target: string;
  scanType: ScanType;
  meshScore: number;
  tier: string;
  signals: Signal[];
  reportMarkdown: string;
  reportHash: string;
  easUid: string;
  reportUrl: string;
  scannedAt: number;
  createdAt?: string;
  /** From the X-Free-Scans-Remaining response header, when present. */
  freeScansRemaining?: number | null;
}

export class MeshApiError extends Error {
  status: number;
  detail?: string;
  paymentRequired: boolean;
  /** Parsed x402 PaymentRequirements (present on 402 responses). */
  requirements?: PaymentRequirements | null;
  constructor(
    status: number,
    message: string,
    detail?: string,
    requirements?: PaymentRequirements | null,
  ) {
    super(message);
    this.name = "MeshApiError";
    this.status = status;
    this.detail = detail;
    this.paymentRequired = status === 402;
    this.requirements = requirements;
  }
}

async function parseError(res: Response): Promise<MeshApiError> {
  let message = res.statusText || `Request failed (${res.status})`;
  let detail: string | undefined;
  let requirements: PaymentRequirements | null = null;

  // x402: requirements may arrive as a base64 header or in the JSON body (`accepts`).
  requirements = decodeRequirements(res.headers.get("X-Payment-Requirements"));

  try {
    const body = await res.json();
    if (body?.error && typeof body.error === "string") message = body.error;
    if (body?.detail) detail = body.detail;
    if (!requirements && Array.isArray(body?.accepts) && body.accepts.length) {
      requirements = body.accepts[0] as PaymentRequirements;
    }
  } catch {
    /* non-JSON error body */
  }

  if (res.status === 402) {
    message = "Payment required";
    detail =
      detail ??
      (requirements
        ? "Free scans used. Pay with USDC on Base to continue."
        : "Free scan quota reached for this month.");
  }
  return new MeshApiError(res.status, message, detail, requirements);
}

function readFreeScans(res: Response): number | null {
  const raw = res.headers.get("X-Free-Scans-Remaining");
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

type RawScan = Partial<{
  id: string;
  uid: string;
  target: string;
  targetAddress: string;
  scanType: string;
  meshScore: number | string;
  tier: string;
  signals: Signal[];
  reportMarkdown: string;
  report: string;
  reportHash: string;
  easUid: string;
  easAttestUID: string;
  reportUrl: string;
  scannedAt: number | string;
  createdAt: string;
}>;

function normalize(raw: RawScan, fallbackType: ScanType, free: number | null): ScanResult {
  return {
    id: raw.id ?? raw.uid ?? "",
    target: raw.target ?? raw.targetAddress ?? "",
    scanType: (raw.scanType as ScanType) ?? fallbackType,
    meshScore: Number(raw.meshScore ?? 0),
    tier: raw.tier ?? "",
    signals: Array.isArray(raw.signals) ? raw.signals : [],
    reportMarkdown: raw.reportMarkdown ?? raw.report ?? "",
    reportHash: raw.reportHash ?? "",
    easUid: raw.easUid ?? raw.easAttestUID ?? "",
    reportUrl: raw.reportUrl ?? "",
    scannedAt: Number(raw.scannedAt ?? 0),
    createdAt: raw.createdAt,
    freeScansRemaining: free,
  };
}

interface ScanArgs {
  input: string;
  type: ScanType;
  signal?: AbortSignal;
  /** Base64 x402 `X-Payment` header, set when retrying a 402 after payment. */
  paymentHeader?: string;
}

/** Run a scan against the correct endpoint based on detected type. */
export async function initiateScan({
  input,
  type,
  signal,
  paymentHeader,
}: ScanArgs): Promise<ScanResult> {
  let url: string;
  if (type === "app") {
    url = `${API_BASE}/v1/scan/app?url=${encodeURIComponent(input)}`;
  } else {
    url = `${API_BASE}/v1/scan/${type}/${input}`;
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (paymentHeader) headers["X-Payment"] = paymentHeader;
  const res = await fetch(url, { signal, headers });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return normalize(data, type, readFreeScans(res));
}

/** Fetch a stored public report by UID. Used server-side on /scan/[uid]. */
export async function getReport(uid: string): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/v1/report/${uid}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return normalize(data, "contract", null);
}

export interface BatchRow {
  address: string;
  meshScore?: number;
  tier?: string;
  error?: string;
}

/** Bulk scan up to 50 addresses. POST /v1/scan/batch. */
export async function batchScan(addresses: string[]): Promise<BatchRow[]> {
  const res = await fetch(`${API_BASE}/v1/scan/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ addresses }),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

export function badgeUrl(address: string): string {
  return `${API_BASE}/v1/badge/${address}`;
}

export function easAttestationUrl(easUid: string): string {
  return `https://base.easscan.org/attestation/view/${easUid}`;
}

export function reportShareUrl(uid: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meshline.io";
  return `${site}/scan/${uid}`;
}
