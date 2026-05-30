// Local scan history — persisted in the browser so the dashboard shows
// a real, honest record of scans run from this device (no backend list endpoint exists).

import type { ScanResult } from "./api";

export interface HistoryEntry {
  id: string;
  target: string;
  scanType: string;
  meshScore: number;
  tier: string;
  scannedAt: number;
}

const KEY = "meshline:history";
const MAX = 50;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordScan(result: ScanResult): void {
  if (typeof window === "undefined" || !result?.id) return;
  const entry: HistoryEntry = {
    id: result.id,
    target: result.target,
    scanType: result.scanType,
    meshScore: result.meshScore,
    tier: result.tier,
    scannedAt: result.scannedAt || Math.floor(Date.now() / 1000),
  };
  const existing = loadHistory().filter((e) => e.id !== entry.id);
  const next = [entry, ...existing].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable */
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
