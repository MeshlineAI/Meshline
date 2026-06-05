import { Check } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    scans: "5 contract scans / mo",
    cta: "Start scanning",
    href: "/dashboard",
    features: ["MESH Score + summary report", "Embeddable trust badge", "Public report page", "EAS attestation"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    cadence: "/mo",
    scans: "Unlimited scans",
    cta: "Go Pro",
    href: "/dashboard",
    features: ["Full 12-signal report", "PDF export", "Private scans", "Alert monitoring"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    cadence: "/mo",
    scans: "Unlimited + bulk API",
    cta: "Contact sales",
    href: "mailto:hello@meshline.tech",
    features: ["Private Base app audits", "Bulk batch API + SSO", "SOC2 export + SLA", "Dedicated Slack"],
    highlight: false,
  },
  {
    name: "x402 Agent",
    price: "Pay-per",
    cadence: "",
    scans: "Unlimited · no account",
    cta: "Read API docs",
    href: "#agents",
    features: ["0.001 USDC / scan", "Structured JSON", "EAS attestation", "Zero setup"],
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative z-10 border-b border-white/10 py-20 sm:py-24">
      <div className="container-mesh">
        <SectionHeading
          index="05"
          eyebrow="Pricing"
          title={
            <>
              Free to start. <span className="text-gradient">Scale when you ship.</span>
            </>
          }
          description="The first 5 scans every month are free — no signup. Agents pay per query."
        />

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.07}>
              <div
                className={cn(
                  "panel lift relative flex h-full flex-col p-7",
                  t.highlight && "border-accent/50 animate-pulse-ring",
                )}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink shadow-glow-cyan" style={{ background: "var(--brand-gradient)" }}>
                    Most popular
                  </span>
                )}
                <div className="eyebrow">{t.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight text-white">{t.price}</span>
                  <span className="text-sm text-muted">{t.cadence}</span>
                </div>
                <div className="mt-1 text-xs text-acid">{t.scans}</div>

                <ul className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#b9cbe0]">
                      <Check size={15} className="mt-0.5 shrink-0 text-cyan-brand" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a href={t.href} className="mt-auto block pt-7 text-center text-xs font-semibold">
                  <span
                    className={cn(
                      "block w-full rounded-full px-4 py-3 transition-all",
                      t.highlight
                        ? "text-ink shadow-glow-cyan hover:brightness-110"
                        : "border border-white/15 text-white hover:border-accent/50 hover:text-accent",
                    )}
                    style={t.highlight ? { background: "var(--brand-gradient)" } : undefined}
                  >
                    {t.cta}
                  </span>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
