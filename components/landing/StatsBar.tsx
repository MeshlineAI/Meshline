import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  { label: "Scans today", value: 12847 },
  { label: "Contracts scanned", value: 284901 },
  { label: "Agent queries", value: 48291 },
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
              className="border-white/[0.06] px-5 py-9 text-center [&:not(:last-child)]:border-r"
            >
              <div className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
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
