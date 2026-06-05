import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "The Meshline whitepaper — AI-powered onchain risk intelligence for Base. The MESH Score, EAS attestation, x402 payments, and the MESH token.",
};

const TOC = [
  { id: "abstract", label: "Abstract" },
  { id: "trust-gap", label: "1. The trust gap" },
  { id: "what-meshline-does", label: "2. What Meshline does" },
  { id: "mesh-score", label: "3. The MESH Score" },
  { id: "signal-engine", label: "4. The signal engine" },
  { id: "ai-reports", label: "5. AI reports" },
  { id: "attestation", label: "6. Onchain attestation" },
  { id: "access-pricing", label: "7. Access & pricing" },
  { id: "mesh-token", label: "8. The MESH token" },
  { id: "staking", label: "9. Staking & revenue share" },
  { id: "agents", label: "10. Built for agents" },
  { id: "architecture", label: "11. Architecture" },
  { id: "roadmap", label: "12. Roadmap" },
  { id: "disclaimer", label: "13. Disclaimers" },
];

const TIERS = [
  { tier: "AAA", range: "900–1000", desc: "Minimal risk — verified, clean, no critical signals." },
  { tier: "AA", range: "800–899", desc: "Low risk — minor or well-understood findings." },
  { tier: "A", range: "650–799", desc: "Moderate risk — review the report before acting." },
  { tier: "BB", range: "450–649", desc: "Elevated risk — meaningful red flags present." },
  { tier: "C", range: "below 450", desc: "High risk — likely unsafe; proceed with extreme caution." },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/[0.07] pt-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-[1.7rem]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function WhitepaperPage() {
  return (
    <PageShell>
      <div className="pb-24">
        <PageHeader
          eyebrow="Whitepaper · v1.0 · June 2026"
          title={
            <>
              The Meshline <span className="text-gradient">whitepaper.</span>
            </>
          }
          description="AI-powered onchain risk intelligence for Base — one MESH Score you can verify, attested onchain, payable per call by humans and agents alike."
        />

        <div className="container-mesh mt-8 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-faint">
          {["Version 1.0", "June 2026", "Base L2", "EAS · x402"].map((m) => (
            <span key={m} className="rounded-full border border-white/10 px-3 py-1">
              {m}
            </span>
          ))}
        </div>

        <div className="container-mesh mt-14 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* sticky table of contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="eyebrow mb-3">Contents</div>
              <nav className="flex flex-col gap-1.5 text-sm">
                {TOC.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="text-muted transition-colors hover:text-white"
                  >
                    {t.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* body */}
          <article className="max-w-3xl">
            <section id="abstract" className="scroll-mt-28">
              <div className="eyebrow">Abstract</div>
              <p className="mt-3 text-base leading-relaxed text-[#aebfd4]">
                Meshline is an AI-powered onchain risk-intelligence layer for Base. It reads any
                contract, wallet, or app, returns a single <strong className="text-white">0–1000
                MESH Score</strong> with a plain-language report, and attests the result onchain via
                the Ethereum Attestation Service (EAS). Scans are paid per call in USDC over the{" "}
                <strong className="text-white">x402</strong> protocol, so Meshline is natively usable
                by both people and autonomous agents. The <strong className="text-white">MESH token</strong>{" "}
                aligns the network: it unlocks scan discounts, can be burned for credits, gates Pro
                access, and shares protocol revenue with stakers.
              </p>
            </section>

            <div className="mt-12 space-y-10">
              <Section id="trust-gap" title="1. The trust gap">
                <p>
                  Base is one of the fastest-growing L2s, with new contracts deployed every day.
                  That growth comes with a problem: users and agents have no fast, neutral way to
                  tell a safe contract from a honeypot, a rug, or an unverified proxy.
                </p>
                <p>
                  Traditional audits are slow, expensive, and static — a snapshot that ages the
                  moment it&apos;s published. Block explorers show raw data, not judgment. The result
                  is a trust gap that throttles onchain adoption and exposes users to avoidable loss.
                  Meshline closes that gap with an instant, neutral, verifiable risk read on any
                  address.
                </p>
              </Section>

              <Section id="what-meshline-does" title="2. What Meshline does">
                <p>Paste any Base address — a contract, a wallet, or an app. Meshline then:</p>
                <ul className="space-y-2">
                  {[
                    "Pulls onchain and source data (Basescan, RPC, EAS).",
                    "Runs a deterministic signal engine across known risk vectors.",
                    "Synthesizes a structured, readable report with a language model.",
                    "Computes a 0–1000 MESH Score and a letter tier.",
                    "Attests the result onchain so it is verifiable and portable.",
                  ].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  Today a full scan takes about 30 seconds; the roadmap brings the core result to
                  under 15. The output is the same whether a human or an agent asked for it.
                </p>
              </Section>

              <Section id="mesh-score" title="3. The MESH Score">
                <p>
                  Every scan resolves to one number from <strong className="text-white">0 to
                  1000</strong> — higher is safer — and a letter tier. The score is a weighted
                  aggregation of severity-tagged signals, with weights continuously recalibrated
                  against false positives seen in production scans.
                </p>
                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-muted-faint">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tier</th>
                        <th className="px-4 py-3 font-medium">Score</th>
                        <th className="px-4 py-3 font-medium">Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIERS.map((t) => (
                        <tr key={t.tier} className="border-t border-white/[0.06]">
                          <td className="px-4 py-3 font-mono font-semibold text-white">{t.tier}</td>
                          <td className="px-4 py-3 font-mono text-muted">{t.range}</td>
                          <td className="px-4 py-3 text-muted">{t.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="signal-engine" title="4. The signal engine">
                <p>
                  Beneath the score sits a deterministic engine of independent checks, each carrying
                  a severity (low, medium, high, critical) that penalizes the base score. Signals
                  include:
                </p>
                <ul className="space-y-2">
                  {[
                    ["Source verification", "Is the contract verified, and does the source match the bytecode?"],
                    ["Proxy & upgradeability", "Can the logic be swapped out from under users?"],
                    ["Deployer history", "What has this deployer shipped before — clean or rugged?"],
                    ["Honeypot detection", "Can funds actually be withdrawn, or only deposited?"],
                    ["Ownership & privilege", "Mint, pause, blacklist, and other privileged powers."],
                    ["Exploit similarity", "Bytecode matched against a curated database of known exploit signatures."],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                      <span>
                        <strong className="text-white">{k}</strong> — {v}
                      </span>
                    </li>
                  ))}
                </ul>
                <p>
                  The exploit-similarity set is sourced from incident archives such as Rekt.news and
                  DeFiHackLabs, and expands over time to sharpen detection accuracy.
                </p>
              </Section>

              <Section id="ai-reports" title="5. AI reports">
                <p>
                  Signals and onchain context are passed to a language model (Gemini 2.0 Flash),
                  which writes a structured report: what the contract is, the key risks in plain
                  language, and a clear recommendation. The model explains the score — it never
                  invents it. Reports are exportable as PDF for sharing and record-keeping.
                </p>
              </Section>

              <Section id="attestation" title="6. Onchain attestation">
                <p>
                  Every result is written as an attestation on the Ethereum Attestation Service
                  (EAS) on Base. That turns a one-off report into reusable public infrastructure. A
                  MESH Score becomes:
                </p>
                <ul className="space-y-2">
                  {[
                    ["Verifiable", "anyone can check the attestation onchain."],
                    ["Portable", "other contracts, apps, and agents can read it."],
                    ["Tamper-evident", "the score can't be silently edited after the fact."],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                      <span>
                        <strong className="text-white">{k}</strong> — {v}
                      </span>
                    </li>
                  ))}
                </ul>
                <p>
                  An indexer ingests all Meshline attestations into a searchable public registry, so
                  lookups are fast and don&apos;t depend on re-scanning.
                </p>
              </Section>

              <Section id="access-pricing" title="7. Access & pricing">
                <p>
                  Meshline is pay-per-use, settled in USDC on Base through x402 — no accounts or API
                  keys required to make a single scan.
                </p>
                <ul className="space-y-2">
                  {[
                    ["Free", "5 scans per month to evaluate Meshline."],
                    ["Pro", "Deeper analysis, scan history, alerts, and batch scanning."],
                    ["Enterprise — $199/mo", "Private audits, bulk API, SSO, SOC2 export, and an SLA."],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                      <span>
                        <strong className="text-white">{k}</strong> — {v}
                      </span>
                    </li>
                  ))}
                </ul>
                <p>Bulk scanning is priced from 0.0005 USDC per address.</p>
              </Section>

              <Section id="mesh-token" title="8. The MESH token">
                <p>
                  MESH is the network&apos;s coordination and access asset. Its utility ties directly
                  to using the protocol:
                </p>
                <ul className="space-y-2">
                  {[
                    ["Discounts", "hold MESH for cheaper scans — e.g. 100 MESH for 20% off, 1,000 for 40%, 10,000 for free Pro."],
                    ["Burn-for-scan", "burn 1 MESH onchain for a one-time scan credit."],
                    ["Pro access", "holding 10,000 MESH unlocks Pro with no recurring payment."],
                    ["Staking", "stake MESH to earn a share of protocol revenue (below)."],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                      <span>
                        <strong className="text-white">{k}</strong> — {v}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-faint">
                  Token utilities are forward-looking and roll out over the roadmap; see the
                  disclaimer.
                </p>
              </Section>

              <Section id="staking" title="9. Staking & revenue share">
                <p>
                  A <strong className="text-white">MeshStaking</strong> contract lets holders stake
                  MESH to earn a share of real protocol revenue. Each week a fixed portion (target
                  20%) of scan revenue is deposited to the contract and distributed pro-rata to
                  stakers in USDC. Stakers also receive priority, sub-5-minute alerting on watched
                  contracts.
                </p>
                <p>
                  The intent is to tie token value to genuine protocol usage — fees from scans people
                  actually run — rather than to token emissions alone.
                </p>
              </Section>

              <Section id="agents" title="10. Built for agents">
                <p>
                  Meshline is designed to be called by software, not just people. &ldquo;Scan before
                  you transact&rdquo; becomes a primitive any agent can use:
                </p>
                <ul className="space-y-2">
                  {[
                    ["x402 payments", "an agent's wallet pays per scan — no keys, no accounts, no signup."],
                    ["MCP endpoint", "scan_contract, scan_wallet, and get_report exposed as tools for Claude, Cursor, and other runtimes."],
                    ["Discovery manifest", "a capability manifest lets Agent.market and the x402 Bazaar auto-discover Meshline's tools, pricing, and schemas."],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                      <span>
                        <strong className="text-white">{k}</strong> — {v}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="architecture" title="11. Architecture">
                <ul className="space-y-2">
                  {[
                    ["Frontend", "Next.js on Base, wallet-native via OnchainKit and agentic wallets."],
                    ["Backend", "a scan pipeline — data ingestion → signal engine → AI synthesis → scoring → EAS attestation — with a Redis cache and a queue for scheduled re-scans."],
                    ["Onchain", "EAS attestations, the MESH token, and the staking contract, all on Base L2."],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                      <span>
                        <strong className="text-white">{k}</strong> — {v}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="roadmap" title="12. Roadmap">
                <p>
                  Meshline ships post-launch in five waves over six months: report quality and Pro
                  foundations, alerts and watched contracts, token and staking integration,
                  enterprise and scale, and agent-native discovery — followed by a more exploratory
                  phase shaped with the community.
                </p>
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-white"
                >
                  <Map size={15} /> See the full 6-month roadmap <ArrowRight size={14} />
                </Link>
              </Section>

              <Section id="disclaimer" title="13. Disclaimers">
                <p className="text-sm text-muted-faint">
                  This document is informational only and is not financial, investment, legal, or
                  security advice. A MESH Score is a risk signal, not a guarantee of safety — never
                  treat it as a substitute for your own due diligence. Token utilities described here
                  are planned and may change as the protocol develops. Always do your own research.
                </p>
              </Section>
            </div>

            {/* footer CTA */}
            <div className="panel mt-14 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Read the risk before you trust it.
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Run your first scan, or see what&apos;s shipping next.
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Link href="/dashboard" className="btn-primary">
                  Start scanning <ArrowRight size={15} />
                </Link>
                <Link href="/roadmap" className="btn-ghost">
                  Roadmap
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </PageShell>
  );
}
