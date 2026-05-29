import type { Signal, RiskTier } from "../types";

const PENALTY: Record<Signal["severity"], number> = {
  none: 0,
  low: 25,
  medium: 75,
  high: 150,
  critical: 300,
};

export function calculateScore(signals: Signal[]): { score: number; tier: RiskTier } {
  const score = Math.max(
    0,
    1000 - signals.reduce((sum, s) => sum + PENALTY[s.severity], 0)
  );

  const tier: RiskTier =
    score >= 900 ? "AAA" :
    score >= 700 ? "AA" :
    score >= 500 ? "A" :
    score >= 300 ? "BB" : "C";

  return { score, tier };
}

export function topSignals(signals: Signal[], n = 3): Signal[] {
  const order: Record<Signal["severity"], number> = {
    critical: 5, high: 4, medium: 3, low: 2, none: 1,
  };
  return [...signals]
    .sort((a, b) => order[b.severity] - order[a.severity])
    .slice(0, n)
    .filter((s) => s.severity !== "none");
}
