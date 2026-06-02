import { Crosshair, Network, BrainCircuit, BadgeCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { DrawLine } from "@/components/ui/DrawLine";

const STEPS = [
  {
    icon: Crosshair,
    title: "Input Detection",
    time: "<100ms",
    body: "Paste a 0x address or app URL. Meshline auto-detects contract, wallet, or Base app.",
  },
  {
    icon: Network,
    title: "Onchain Fetch",
    time: "1–3s",
    body: "Viem reads bytecode, ABI, tx history, token holders, and LP depth from Base.",
  },
  {
    icon: BrainCircuit,
    title: "AI Risk Analysis",
    time: "5–10s",
    body: "12 signals run in parallel; AI writes human-readable findings + remediation.",
  },
  {
    icon: BadgeCheck,
    title: "EAS Attestation",
    time: "2–4s",
    body: "MESH Score is attested onchain via EAS. Public report + trust badge generated.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative z-10 border-b border-white/10 py-20 sm:py-24">
      <div className="container-mesh">
        <SectionHeading
          index="01"
          eyebrow="How a scan works"
          title={
            <>
              From paste to report in{" "}
              <span className="text-gradient">under 30 seconds.</span>
            </>
          }
          description="One input. One pipeline. Every scan runs real onchain analysis, an AI write-up, and an onchain attestation — automatically."
        />

        <div className="relative mt-12 grid gap-5 sm:mt-16 md:grid-cols-4">
          {/* connecting line on desktop — draws itself in on scroll */}
          <DrawLine className="pointer-events-none absolute left-0 right-0 top-9 hidden md:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="group relative">
              <div className="panel lift h-full p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-brand/30 bg-cyan-brand/5 text-cyan-brand transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-brand/60 group-hover:bg-cyan-brand/10 group-hover:shadow-glow-cyan">
                    <step.icon size={20} />
                  </div>
                  <span className="mono rounded-full border border-acid/30 px-2.5 py-1 text-[10px] uppercase tracking-widest text-acid">
                    {step.time}
                  </span>
                </div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-faint">
                  Step {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
