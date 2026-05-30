"use client";

import Link from "next/link";
import { Bell, Crown, FileDown, Coins, Wallet, Radar } from "lucide-react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { PageHeader } from "@/components/layout/PageShell";
import { ScanInput } from "@/components/scan/ScanInput";
import { Reveal } from "@/components/ui/Reveal";
import { ScanHistory } from "./ScanHistory";
import { BatchScan } from "./BatchScan";
import { truncateMiddle } from "@/lib/utils";

export function DashboardContent() {
  const { address } = useWallet();

  if (!address) {
    return (
      <div className="container-mesh flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-brand/30 bg-cyan-brand/5 text-cyan-brand">
          <Wallet size={26} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">Connect to view your dashboard</h1>
        <p className="mt-3 max-w-sm text-sm text-muted">
          Track scan history, run batch portfolio scans, manage alerts, and stake MESH. Your scan
          history from this device is shown once connected.
        </p>
        <div className="mt-7">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={
          <>
            Your risk <span className="text-gradient">command center.</span>
          </>
        }
        description="Scan history, batch portfolio checks, alerts, and MESH staking — all in one place."
      />

      {/* scan tool — lives here, behind wallet connect */}
      <section id="scan-tool" className="container-mesh mt-10 scroll-mt-28">
        <Reveal blur>
          <div className="panel p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                <Radar size={17} />
              </span>
              <div>
                <div className="eyebrow">Run a scan</div>
                <h2 className="text-base font-semibold text-white">
                  Scan a contract, wallet, or Base app
                </h2>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-sm text-muted">
              Paste any Base contract, wallet address, or app URL. Meshline returns a MESH Score and
              a full AI risk report, attested onchain via EAS. First 3 scans each month are free.
            </p>
            <div className="mt-6 flex justify-start">
              <ScanInput />
            </div>
          </div>
        </Reveal>
      </section>

      <div className="container-mesh mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <ScanHistory />
          <BatchScan />
        </div>

        <aside className="space-y-6">
          {/* account */}
          <div className="panel p-6">
            <div className="eyebrow mb-4">Account</div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-brand to-acid text-ink">
                <Wallet size={16} />
              </div>
              <div>
                <div className="mono text-sm text-white">{truncateMiddle(address, 6, 4)}</div>
                <div className="text-[11px] text-muted">Base · connected</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-white/10 py-3">
                <div className="mono text-lg font-semibold text-white">Free</div>
                <div className="eyebrow mt-0.5">Plan</div>
              </div>
              <div className="rounded-xl border border-white/10 py-3">
                <div className="mono text-lg font-semibold text-acid">0</div>
                <div className="eyebrow mt-0.5">MESH</div>
              </div>
            </div>
          </div>

          {/* upgrade */}
          <div className="panel border-cyan-brand/30 bg-cyan-brand/[0.03] p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Crown size={16} className="text-cyan-brand" /> Upgrade to Pro
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Unlimited scans, full 12-signal reports, PDF export, private scans, and alert
              monitoring — $49/mo.
            </p>
            <Link href="/#pricing" className="btn-primary mt-4 w-full text-xs">
              Go Pro
            </Link>
          </div>

          {/* quick actions */}
          <div className="panel divide-y divide-white/[0.06] p-2">
            {[
              { icon: Bell, label: "Alert monitoring", note: "Pro" },
              { icon: FileDown, label: "PDF report export", note: "Pro" },
              { icon: Coins, label: "Stake MESH", note: "/token", href: "/token" },
            ].map((a) =>
              a.href ? (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between px-4 py-3 text-sm text-white transition-colors hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-2.5">
                    <a.icon size={15} className="text-muted" /> {a.label}
                  </span>
                  <span className="mono text-[11px] text-cyan-brand">{a.note}</span>
                </Link>
              ) : (
                <div
                  key={a.label}
                  className="flex items-center justify-between px-4 py-3 text-sm text-muted"
                >
                  <span className="flex items-center gap-2.5">
                    <a.icon size={15} className="text-muted-faint" /> {a.label}
                  </span>
                  <span className="mono rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase text-muted-faint">
                    {a.note}
                  </span>
                </div>
              ),
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
