"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ArrowUpRight, History } from "lucide-react";
import { loadHistory, clearHistory, type HistoryEntry } from "@/lib/history";
import { tierColor } from "@/lib/scoring";
import { truncateMiddle, formatRelative } from "@/lib/utils";

export function ScanHistory() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadHistory());
    setReady(true);
  }, []);

  const onClear = () => {
    clearHistory();
    setItems([]);
  };

  return (
    <div className="panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <History size={16} className="text-cyan-brand" /> Scan history
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-tier-c"
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {ready && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-sm text-muted">No scans yet from this device.</p>
          <Link
            href="#scan-tool"
            className="mt-3 inline-block text-xs font-semibold text-accent hover:underline"
          >
            Run your first scan →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {items.map((it) => {
            const color = tierColor(it.tier, it.meshScore);
            return (
              <Link
                key={it.id}
                href={`/scan/${it.id}`}
                className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-white/[0.02]"
              >
                <span
                  className="mono w-12 shrink-0 text-lg font-semibold tabular-nums"
                  style={{ color }}
                >
                  {it.meshScore}
                </span>
                <span
                  className="mono shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{ borderColor: `${color}55`, color }}
                >
                  {it.tier}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mono truncate text-sm text-white">
                    {truncateMiddle(it.target, 14, 8)}
                  </div>
                  <div className="text-[11px] text-muted-faint">
                    {it.scanType} · {formatRelative(it.scannedAt)}
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-muted-faint transition-colors group-hover:text-cyan-brand"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
