import type { RiskTier } from "../types";

const TIER_COLOR: Record<RiskTier, string> = {
  AAA: "#00e5ff",
  AA: "#69ff47",
  A: "#ffeb3b",
  BB: "#ff9800",
  C: "#ff1744",
};

const TIER_LABEL: Record<RiskTier, string> = {
  AAA: "VERIFIED SAFE",
  AA: "LOW RISK",
  A: "CAUTION",
  BB: "HIGH RISK",
  C: "DANGER",
};

export function generateBadgeSvg(params: {
  score: number;
  tier: RiskTier;
  target: string;
  reportUrl: string;
}): string {
  const color = TIER_COLOR[params.tier];
  const label = TIER_LABEL[params.tier];
  const shortTarget =
    params.target.startsWith("0x")
      ? `${params.target.slice(0, 6)}…${params.target.slice(-4)}`
      : params.target.slice(0, 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="44" role="img" aria-label="Meshline Security Score: ${params.score}">
  <title>Meshline Security Score: ${params.score} — ${label}</title>
  <defs>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#111111"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="200" height="44" rx="6" fill="url(#bg)"/>
  <rect x="0" y="0" width="90" height="44" rx="6" fill="#0a0a0a"/>
  <rect x="84" y="0" width="6" height="44" fill="#0a0a0a"/>

  <!-- Left side: MESHLINE -->
  <text x="45" y="17" font-size="9" font-family="monospace,courier" fill="#888888" text-anchor="middle" letter-spacing="1">MESHLINE</text>
  <text x="45" y="32" font-size="10" font-family="monospace,courier" fill="#ffffff" text-anchor="middle">${shortTarget}</text>

  <!-- Right side: score + tier -->
  <text x="145" y="19" font-size="16" font-weight="bold" font-family="monospace,courier" fill="${color}" text-anchor="middle">${params.score}</text>
  <text x="145" y="32" font-size="8" font-family="monospace,courier" fill="${color}" text-anchor="middle" opacity="0.85">${params.tier} · ${label}</text>
</svg>`;
}
