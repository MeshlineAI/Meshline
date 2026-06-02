import { VideoBackground } from "@/components/ui/VideoBackground";
import { Reveal } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Parallax";

const SIGNALS = [
  { magnitude: "$340M+", label: "lost to rug pulls on Base in 2025 alone", source: "Chainalysis" },
  { magnitude: "~65%", label: "of Base contracts deployed without source verification", source: "Dune Analytics" },
  { magnitude: "12+", label: "unlimited ERC-20 approvals on the average Base wallet", source: "Revoke.cash" },
  { magnitude: "480K+", label: "AI agents now transacting on x402 / Base each month", source: "x402 Foundation" },
  { magnitude: "0", label: "Base-native products give a pre-interaction risk report", source: "Meshline research" },
];

export function ProblemSection() {
  return (
    <section className="relative z-10 overflow-hidden border-b border-white/10 py-20 sm:py-24">
      <div className="container-mesh grid items-center gap-10 sm:gap-12 lg:grid-cols-2">
        {/* video card */}
        <Reveal className="order-2 lg:order-1">
          <Parallax offset={36}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
            <VideoBackground
              src="/videos/data-tunnel.mp4"
              poster="/videos/data-tunnel-poster.jpg"
              playInView
              className="opacity-80"
              overlayClassName="bg-gradient-to-t from-ink via-ink/30 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 z-[2] p-6">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">
                Live on Base · right now
              </div>
              <div className="mt-1.5 text-xl font-semibold text-white">
                New threats, <span className="text-gradient">invisible onchain.</span>
              </div>
            </div>
          </div>
          </Parallax>
        </Reveal>

        {/* stats */}
        <div className="order-1 lg:order-2">
          <Reveal>
            <div className="mb-4 flex items-center gap-2.5 text-[10.5px] font-medium uppercase tracking-[0.2em]">
              <span className="font-serif-display text-sm normal-case tracking-normal text-accent">02</span>
              <span aria-hidden className="h-px w-6 bg-white/15" />
              <span className="text-muted">The problem</span>
            </div>
            <h2 className="font-display text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl">
              Onchain risk is invisible — <span className="text-gradient">until it drains you.</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
              The data exists onchain, but reading it takes deep expertise. Most users skip the
              check. Most agents don&apos;t check at all.
            </p>
          </Reveal>

          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {SIGNALS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <div className="group flex items-baseline gap-3 py-4 transition-colors sm:gap-4">
                  <span className="mono w-[4.5rem] shrink-0 text-lg font-semibold text-tier-c transition-transform duration-300 group-hover:-translate-y-0.5 sm:w-24 sm:text-xl">
                    {s.magnitude}
                  </span>
                  <span className="flex-1 text-sm text-[#c2d2e4]">{s.label}</span>
                  <span className="mono hidden shrink-0 text-[10px] uppercase tracking-widest text-muted-faint sm:block">
                    {s.source}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
