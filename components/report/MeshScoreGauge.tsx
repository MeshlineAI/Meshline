"use client";

import { useEffect, useRef, useState } from "react";
import { gaugeColor, tierLabel } from "@/lib/scoring";

interface MeshScoreGaugeProps {
  score: number;
  tier: string;
}

const R = 40;
const CIRC = 2 * Math.PI * R; // ≈ 251.3

export function MeshScoreGauge({ score, tier }: MeshScoreGaugeProps) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const color = gaugeColor(score);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(score);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(score * eased);
      if (t < 1) requestAnimationFrame(tick);
      else setDisplay(score);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const dash = (display / 1000) * CIRC;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-52 w-52">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#0C1420" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mono text-5xl font-semibold tabular-nums" style={{ color }}>
            {Math.round(display)}
          </span>
          <span className="mono mt-1 text-[11px] uppercase tracking-[0.3em] text-muted">
            / 1000
          </span>
        </div>
      </div>

      <div
        className="mt-5 flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold uppercase tracking-widest"
        style={{ borderColor: color, color }}
      >
        {tier || "—"}
        <span className="text-[11px] font-medium text-muted">· {tierLabel(tier, score)}</span>
      </div>
    </div>
  );
}
