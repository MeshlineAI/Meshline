import { severityColor, normalizeSeverity } from "@/lib/scoring";
import type { Signal } from "@/lib/api";

export function SignalCard({ signal }: { signal: Signal }) {
  const sev = normalizeSeverity(signal.severity as string);
  const color = severityColor(sev);

  return (
    <div className="panel flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-bold leading-snug text-white">{signal.name}</h4>
        <span
          className="mono shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest"
          style={{ borderColor: `${color}66`, color }}
        >
          {sev}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted">{signal.description}</p>
    </div>
  );
}
