import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileText } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Meshline's 6-month shipping plan — from report quality and Pro foundations to token staking, enterprise scale, and agentic discovery on Base.",
};

type Status = "Shipping now" | "Next up" | "Planned" | "Exploring";

const STATUS_STYLES: Record<Status, string> = {
  "Shipping now": "border-accent/40 bg-accent/10 text-accent",
  "Next up": "border-accent-soft/40 bg-accent-soft/10 text-accent-soft",
  Planned: "border-white/15 bg-white/[0.04] text-muted",
  Exploring: "border-white/10 bg-white/[0.02] text-muted-faint",
};

type Phase = {
  month: string;
  wave: string;
  title: string;
  status: Status;
  summary: string;
  items: { title: string; note: string }[];
};

const PHASES: Phase[] = [
  {
    month: "Month 1 · Jun 2026",
    wave: "Wave 1",
    title: "Report quality + Pro foundation",
    status: "Shipping now",
    summary:
      "Sharper AI reports and the groundwork that the paid tiers stand on — faster model, exportable reports, and a cache that survives restarts.",
    items: [
      { title: "Gemini 2.0 Flash", note: "Faster, sharper risk reports across every scan." },
      { title: "PDF report export", note: "Download any MESH report as a shareable PDF." },
      { title: "Free tier → 5 scans/mo", note: "More room to try Meshline before paying." },
      { title: "Redis scan cache", note: "Persistent, multi-instance cache that scales." },
      { title: "Signal weight tuning", note: "Severity scoring recalibrated on production data." },
    ],
  },
  {
    month: "Month 2 · Jul 2026",
    wave: "Wave 2",
    title: "Alerts + watched contracts",
    status: "Next up",
    summary:
      "Meshline starts watching for you — track contracts, get re-scanned automatically, and hear about it the moment risk changes.",
    items: [
      { title: "Watched contracts", note: "Auto re-scanned every 6 hours, surfaced on your dashboard." },
      { title: "MESH Score drop alerts", note: "Flagged with the point delta when a score degrades." },
      { title: "Email notifications", note: "Resend-powered alerts straight to your inbox." },
      { title: "Scan history by address", note: "Every past scan for an address, with scores + timestamps." },
      { title: "Priority alert tier", note: "Sub-5-minute alerting groundwork for MESH stakers." },
    ],
  },
  {
    month: "Month 3 · Aug 2026",
    wave: "Wave 3",
    title: "Token + staking integration",
    status: "Planned",
    summary:
      "MESH goes live as the network's access asset — discounts, burnable scan credits, and a staking contract that shares protocol revenue.",
    items: [
      { title: "Balance discounts", note: "Hold MESH for cheaper scans — up to free Pro." },
      { title: "Burn for a free scan", note: "Burn 1 MESH on-chain for a one-time scan credit." },
      { title: "Staking dashboard", note: "TVL, staker count, weekly USDC distributed, your reward." },
      { title: "Weekly revenue split", note: "A share of scan revenue distributed to stakers in USDC." },
      { title: "Hold-for-Pro", note: "Hold 10,000 MESH to unlock Pro with no subscription." },
    ],
  },
  {
    month: "Month 4 · Sep 2026",
    wave: "Wave 4",
    title: "Enterprise + scale",
    status: "Planned",
    summary:
      "The features security teams and protocols need to standardize on Meshline — keys, privacy, bulk, compliance, and partner integrations.",
    items: [
      { title: "API key auth", note: "Generate, name, revoke keys with per-key usage stats." },
      { title: "Private scans", note: "Keep sensitive scans out of the public registry." },
      { title: "Batch 50 → 200", note: "Bigger portfolios in a single call, rate-limit aware." },
      { title: "SOC2 audit log export", note: "CSV evidence packs for compliance and audits." },
      { title: "Partner pre-scan webhook", note: "“Scan before depositing” for Morpho / Aerodrome-style apps." },
    ],
  },
  {
    month: "Month 5 · Oct 2026",
    wave: "Wave 5",
    title: "Agent + discovery scale",
    status: "Planned",
    summary:
      "Meshline becomes a primitive any agent can call — discoverable, MCP-native, indexed on-chain, and fast enough to sit inline before a transaction.",
    items: [
      { title: "MCP skill endpoint", note: "scan_contract / scan_wallet / get_report for Claude & Cursor." },
      { title: "Discovery metadata", note: "Capability manifest for Agent.market and the x402 Bazaar." },
      { title: "Attestation indexer", note: "All EAS attestations indexed into a public registry." },
      { title: "Exploit DB expansion", note: "From ~7 to 50+ known exploit signatures." },
      { title: "Sub-15s scans", note: "Core score returned instantly; attestation finalizes async." },
    ],
  },
  {
    month: "Month 6 · Nov 2026",
    wave: "Beyond",
    title: "Scale + decentralization",
    status: "Exploring",
    summary:
      "Directional, not committed — where Meshline goes once the core network is proven. Shaped with the community.",
    items: [
      { title: "Multi-chain expansion", note: "Take the MESH Score beyond Base." },
      { title: "Community signals", note: "Contributor-sourced signals and exploit intelligence." },
      { title: "Score API SLAs", note: "Hardened, rate-guaranteed Score API for integrators." },
      { title: "Continuous tuning", note: "Ongoing model + signal improvements from live data." },
    ],
  },
];

const LEGEND: Status[] = ["Shipping now", "Next up", "Planned", "Exploring"];

export default function RoadmapPage() {
  return (
    <PageShell>
      <div className="pb-24">
        <PageHeader
          eyebrow="Roadmap · 6 months"
          title={
            <>
              What we&apos;re <span className="text-gradient">shipping next.</span>
            </>
          }
          description="A post-launch plan in five waves — one theme a month, from report quality to a live MESH token, enterprise scale, and agent-native discovery. Dates are targets, not promises."
        />

        {/* legend */}
        <div className="container-mesh mt-8 flex flex-wrap items-center gap-2">
          {LEGEND.map((s) => (
            <span
              key={s}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                STATUS_STYLES[s],
              )}
            >
              {s}
            </span>
          ))}
        </div>

        {/* timeline */}
        <div className="container-mesh mt-14">
          <div className="relative mx-auto max-w-4xl">
            <div
              aria-hidden
              className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent sm:left-[15px]"
            />
            <div className="space-y-6">
              {PHASES.map((phase, i) => (
                <Reveal key={phase.month} delay={i * 0.05}>
                  <div className="relative pl-10 sm:pl-14">
                    {/* node */}
                    <span className="absolute left-0 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-ink-800 sm:h-8 sm:w-8">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          phase.status === "Shipping now"
                            ? "animate-pulse-glow bg-accent shadow-[0_0_8px] shadow-accent"
                            : phase.status === "Next up"
                              ? "bg-accent-soft"
                              : "bg-muted-faint",
                        )}
                      />
                    </span>

                    <div className="panel panel-hover p-6 sm:p-7">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="eyebrow">
                            {phase.month} · {phase.wave}
                          </div>
                          <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                            {phase.title}
                          </h2>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                            STATUS_STYLES[phase.status],
                          )}
                        >
                          {phase.status}
                        </span>
                      </div>

                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                        {phase.summary}
                      </p>

                      <div className="mt-5 grid gap-x-6 gap-y-3.5 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
                        {phase.items.map((it) => (
                          <div key={it.title} className="flex gap-3">
                            <Check size={15} className="mt-0.5 shrink-0 text-accent-soft" />
                            <div>
                              <div className="text-sm font-medium text-white">{it.title}</div>
                              <div className="mt-0.5 text-[13px] leading-relaxed text-muted">
                                {it.note}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container-mesh mt-16">
          <div className="panel relative mx-auto max-w-4xl overflow-hidden p-10 text-center">
            <div className="grid-dots pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                The full picture lives in the <span className="text-gradient">whitepaper.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted">
                How the MESH Score, onchain attestation, and the MESH token fit together — read the
                whitepaper, or start scanning now.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/whitepaper" className="btn-primary">
                  <FileText size={15} /> Read the whitepaper
                </Link>
                <Link href="/dashboard" className="btn-ghost">
                  Open dashboard <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
