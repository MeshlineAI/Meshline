import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Scans today", value: 137 },
  { label: "Contracts scanned", value: 689 },
  { label: "Agent queries", value: 264 },
  { label: "Risk signals", value: 22 },
];

export function StatsBar() {
  return (
    <section className="relative z-10 -mt-px py-10">
      <div className="container-mesh">
        <div className="panel grid grid-cols-2 overflow-hidden sm:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className={cn(
                "group px-5 py-9 text-center transition-colors hover:bg-white/[0.02]",
                // 2-col mobile grid lines: left column gets a right divider,
                // top row gets a bottom divider.
                i % 2 === 0 && "border-r",
                i < 2 && "border-b sm:border-b-0",
                // 4-col desktop: a right divider between every column but the last.
                i !== 3 && "sm:border-r",
              )}
            >
              <div className="font-display text-3xl font-semibold tracking-tight text-white transition-colors group-hover:text-accent sm:text-4xl">
                <CountUp to={s.value} />
              </div>
              <div className="eyebrow mt-2">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
