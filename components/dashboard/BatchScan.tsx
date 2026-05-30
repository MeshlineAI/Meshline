"use client";

import { useState } from "react";
import { Layers, Loader2, AlertTriangle } from "lucide-react";
import { batchScan, MeshApiError, type BatchRow } from "@/lib/api";
import { tierColor } from "@/lib/scoring";
import { truncateMiddle } from "@/lib/utils";

const ADDRESS_RE = /0x[a-fA-F0-9]{40}/g;

export function BatchScan() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<BatchRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addresses = Array.from(new Set(text.match(ADDRESS_RE) ?? [])).slice(0, 50);

  const run = async () => {
    if (!addresses.length || loading) return;
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      const result = await batchScan(addresses);
      setRows(result);
    } catch (e) {
      if (e instanceof MeshApiError && e.paymentRequired) {
        setError("Batch scanning requires an x402 USDC payment on Base (no free tier).");
      } else if (e instanceof MeshApiError) {
        setError(e.detail ? `${e.message} — ${e.detail}` : e.message);
      } else {
        setError("Batch scan failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-6">
      <div className="mb-1 flex items-center gap-2">
        <Layers size={16} className="text-acid" />
        <h2 className="text-sm font-semibold text-white">Batch scan</h2>
      </div>
      <p className="mb-4 text-xs text-muted">
        Paste up to 50 Base addresses (any separator). Returns a MESH Score + tier per address.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        spellCheck={false}
        placeholder="0xabc…  0xdef…  0x123…"
        className="mono w-full resize-y rounded-xl border border-white/10 bg-ink p-3 text-xs text-white placeholder-muted-faint focus:border-cyan-brand/40 focus:outline-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="mono text-[11px] text-muted-faint">
          {addresses.length} address{addresses.length === 1 ? "" : "es"} detected
        </span>
        <button
          type="button"
          onClick={run}
          disabled={!addresses.length || loading}
          className="inline-flex items-center gap-2 rounded-full bg-acid px-5 py-2.5 text-xs font-semibold text-ink transition-all hover:shadow-glow-acid disabled:opacity-40 disabled:shadow-none"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          {loading ? "Scanning…" : "Run batch"}
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-tier-c/40 bg-tier-c/10 px-3 py-2.5 text-xs text-tier-c">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {rows && (
        <div className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/10">
          {rows.map((r, i) => {
            const color = r.tier ? tierColor(r.tier, r.meshScore ?? 0) : "#7C93AD";
            return (
              <div key={`${r.address}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
                <span className="mono min-w-0 flex-1 truncate text-xs text-white">
                  {truncateMiddle(r.address, 12, 8)}
                </span>
                {r.error ? (
                  <span className="text-[11px] text-tier-c">{r.error}</span>
                ) : (
                  <>
                    <span className="mono text-sm font-semibold" style={{ color }}>
                      {r.meshScore}
                    </span>
                    <span
                      className="mono rounded-full border px-2 py-0.5 text-[10px] uppercase"
                      style={{ borderColor: `${color}55`, color }}
                    >
                      {r.tier}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
