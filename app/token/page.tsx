import type { Metadata } from "next";
import { Coins, Percent, BadgeCheck, Zap, Recycle, PiggyBank } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { StakeCard } from "@/components/token/StakeCard";

export const metadata: Metadata = {
  title: "MESH Token",
  description:
    "MESH — ERC-20 on Base. Scan credits, scan discounts, 20% revenue share, buyback-and-burn. 50M fixed supply.",
};

const SUPPLY_STATS = [
  { label: "Total supply", value: "50,000,000" },
  { label: "Standard", value: "ERC-20" },
  { label: "Network", value: "Base L2" },
  { label: "Rev share", value: "20%" },
];

const UTILITY = [
  { icon: Coins, title: "Scan Credits", body: "1 MESH = 1 free Pro scan. Burn-on-use — continuous organic demand." },
  { icon: Percent, title: "Scan Discount", body: "Hold 100 MESH = 20% off Pro · 1,000 = 40% off · 10,000 = free Pro." },
  { icon: BadgeCheck, title: "Badge Premium", body: "Stake to unlock animated, color-custom, and verified-auditor trust badges." },
  { icon: Zap, title: "Alert Boost", body: "Stake for sub-5-minute alert latency when a watched score changes." },
  { icon: PiggyBank, title: "Revenue Share", body: "20% of all scan revenue distributed weekly to stakers in USDC on Base." },
  { icon: Recycle, title: "Buyback & Burn", body: "10% of revenue buys MESH from Aerodrome and permanently burns it." },
];

const DISCOUNTS = [
  { hold: "100 MESH", perk: "20% off Pro subscription" },
  { hold: "1,000 MESH", perk: "40% off Pro subscription" },
  { hold: "10,000 MESH", perk: "Free Pro — forever" },
];

const DISTRIBUTION = [
  { label: "Airdrop — early Base projects", pct: 40, color: "#00E5FF" },
  { label: "Treasury", pct: 25, color: "#69FF47" },
  { label: "Team (12mo cliff)", pct: 20, color: "#AAFF00" },
  { label: "Public sale", pct: 15, color: "#FFEB3B" },
];

export default function TokenPage() {
  return (
    <PageShell>
      <div className="pb-24">
        <PageHeader
          eyebrow="MESHLINE Token · MESH"
          title={
            <>
              The token that powers <span className="text-gradient">the risk layer.</span>
            </>
          }
          description="MESH is a fixed-supply ERC-20 on Base. It pays for scans, discounts Pro, shares revenue with stakers, and gets bought back and burned from every dollar of revenue."
        />

        {/* supply stats */}
        <div className="container-mesh mt-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUPPLY_STATS.map((s) => (
              <div key={s.label} className="panel p-5 text-center">
                <div className="mono text-xl font-semibold text-cyan-brand">{s.value}</div>
                <div className="eyebrow mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* stake + discount */}
        <div className="container-mesh mt-6 grid gap-6 lg:grid-cols-2">
          <StakeCard />
          <div className="panel p-6">
            <h2 className="text-sm font-semibold text-white">Holder discount tiers</h2>
            <p className="mt-2 text-xs text-muted">Hold MESH in your wallet — discounts apply automatically.</p>
            <div className="mt-5 divide-y divide-white/[0.06]">
              {DISCOUNTS.map((d) => (
                <div key={d.hold} className="flex items-center justify-between py-3.5">
                  <span className="mono text-sm font-semibold text-white">{d.hold}</span>
                  <span className="text-sm text-acid">{d.perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* utility grid */}
        <div className="container-mesh mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Token utility</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UTILITY.map((u, i) => (
              <Reveal key={u.title} delay={i * 0.05}>
                <div className="panel panel-hover h-full p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-brand/30 bg-cyan-brand/5 text-cyan-brand">
                    <u.icon size={18} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{u.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{u.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* distribution */}
        <div className="container-mesh mt-16">
          <div className="panel p-7">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Distribution</h2>
            <div className="mt-6 space-y-5">
              {DISTRIBUTION.map((d) => (
                <div key={d.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-[#c2d2e4]">{d.label}</span>
                    <span className="mono font-semibold" style={{ color: d.color }}>
                      {d.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-600">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${d.pct}%`, background: d.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
