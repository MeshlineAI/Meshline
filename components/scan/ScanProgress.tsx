"use client";

import { useEffect, useRef, useState } from "react";
import type { ScanType } from "@/lib/api";

const STAGES = [
  "Detecting input type",
  "Reading onchain data · Viem",
  "Computing risk signals",
  "Generating AI report · Gemini",
  "Finalizing report · EAS attestation queued",
];

/** Faux-staged progress for the (~25s) synchronous scan call, so it feels live. */
export function ScanProgress({ type }: { type: ScanType }) {
  const [pct, setPct] = useState(4);
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(performance.now());

  useEffect(() => {
    const id = setInterval(() => {
      const t = (performance.now() - start.current) / 1000;
      setElapsed(t);
      // approach ~94% over ~26s, then hold until the real response routes away
      const target = 94 * (1 - Math.exp(-t / 9));
      setPct((p) => Math.max(p, Math.min(94, target)));
      setStage(Math.min(STAGES.length - 1, Math.floor(t / 5)));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-brand/30 bg-ink-800/80 p-6 text-left backdrop-blur-sm">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
        <span className="text-cyan-brand">&gt; Scanning {type}</span>
        <span className="text-muted">{elapsed.toFixed(1)}s</span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-600">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-brand to-acid transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-1.5 font-mono text-xs">
        {STAGES.map((label, i) => {
          const done = i < stage;
          const active = i === stage;
          return (
            <li
              key={label}
              className={
                done ? "text-acid" : active ? "text-white" : "text-muted-faint"
              }
            >
              <span className="mr-2">
                {done ? "[✓]" : active ? "[•]" : "[ ]"}
              </span>
              {label}
              {active && <span className="animate-blink ml-1 text-cyan-brand">_</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
