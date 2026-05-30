// Centralized MESH Score → tier/colour mapping (source: frontend-integration.md).

export type Tier = "AAA" | "AA" | "A" | "BB" | "C";
export type Severity = "none" | "low" | "medium" | "high" | "critical";

// Cohesive, slightly desaturated risk palette (matches tailwind `tier.*`).
export const TIER_COLOR: Record<Tier, string> = {
  AAA: "#5BC8E6",
  AA: "#7BE0B0",
  A: "#E8C766",
  BB: "#E0934E",
  C: "#E06A78",
};

export const TIER_LABEL: Record<Tier, string> = {
  AAA: "Verified Safe",
  AA: "Low Risk",
  A: "Caution",
  BB: "High Risk",
  C: "Danger",
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  none: "#6B7787",
  low: "#E8C766",
  medium: "#E0934E",
  high: "#E0734E",
  critical: "#E06A78",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  none: 1,
};

/** Derive a tier from a 0–1000 MESH Score (fallback when the API omits it). */
export function tierFromScore(score: number): Tier {
  if (score >= 900) return "AAA";
  if (score >= 700) return "AA";
  if (score >= 500) return "A";
  if (score >= 300) return "BB";
  return "C";
}

export function normalizeTier(tier?: string, score = 0): Tier {
  const t = (tier ?? "").toUpperCase();
  if (t === "AAA" || t === "AA" || t === "A" || t === "BB" || t === "C") return t;
  return tierFromScore(score);
}

export function tierColor(tier?: string, score = 0): string {
  return TIER_COLOR[normalizeTier(tier, score)];
}

export function tierLabel(tier?: string, score = 0): string {
  return TIER_LABEL[normalizeTier(tier, score)];
}

export function normalizeSeverity(sev?: string): Severity {
  const s = (sev ?? "none").toLowerCase();
  if (s === "low" || s === "medium" || s === "high" || s === "critical" || s === "none")
    return s;
  return "none";
}

export function severityColor(sev?: string): string {
  return SEVERITY_COLOR[normalizeSeverity(sev)];
}

/** Continuous gauge colour by score (cyan → mint → amber → red). */
export function gaugeColor(score: number): string {
  if (score >= 900) return "#5BC8E6";
  if (score >= 700) return "#7BE0B0";
  if (score >= 500) return "#E8C766";
  if (score >= 300) return "#E0934E";
  return "#E06A78";
}
