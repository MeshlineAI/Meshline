import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getReport, MeshApiError, easAttestationUrl, type ScanResult } from "@/lib/api";
import { tierColor, tierLabel, normalizeSeverity, SEVERITY_ORDER, type Severity } from "@/lib/scoring";
import { formatRelative } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/nav/Footer";
import { ScanlineOverlay } from "@/components/ui/ScanlineOverlay";
import { MeshScoreGauge } from "@/components/report/MeshScoreGauge";
import { SignalCard } from "@/components/report/SignalCard";
import { AIReport } from "@/components/report/AIReport";
import { EASAttestationCard } from "@/components/report/EASAttestationCard";
import { TrustBadgeEmbed } from "@/components/report/TrustBadgeEmbed";
import { SharePanel } from "@/components/report/SharePanel";
import { PrintButton } from "@/components/report/PrintButton";

const loadReport = cache(getReport);

export async function generateMetadata({
  params,
}: {
  params: { uid: string };
}): Promise<Metadata> {
  try {
    const r = await loadReport(params.uid);
    const title = `MESH Score ${r.meshScore} · ${r.tier} — ${r.target.slice(0, 10)}…`;
    return {
      title,
      description: `${r.scanType} scan on Base · MESH Score ${r.meshScore}/1000 (${r.tier}). Onchain risk report, EAS-attested.`,
      openGraph: { title, type: "article" },
    };
  } catch {
    return { title: "Scan report" };
  }
}

function severityBreakdown(signals: ScanResult["signals"]) {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
  };
  for (const s of signals) counts[normalizeSeverity(s.severity as string)]++;
  return counts;
}

export default async function ScanReportPage({ params }: { params: { uid: string } }) {
  let report: ScanResult;
  try {
    report = await loadReport(params.uid);
  } catch (e) {
    if (e instanceof MeshApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e; // surfaces app/scan/[uid]/error boundary or default 500
  }

  const color = tierColor(report.tier, report.meshScore);
  const counts = severityBreakdown(report.signals);
  const sortedSignals = [...report.signals].sort(
    (a, b) =>
      SEVERITY_ORDER[normalizeSeverity(b.severity as string)] -
      SEVERITY_ORDER[normalizeSeverity(a.severity as string)],
  );

  return (
    <>
      <ScanlineOverlay />

      {/* top bar */}
      <header className="no-print sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-md">
        <div className="container-mesh flex h-16 items-center justify-between">
          <Link href="/" aria-label="Meshline home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <SharePanel uid={report.id} score={report.meshScore} tier={report.tier} />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="container-mesh max-w-5xl py-10">
          {/* report header */}
          <div className="mb-8">
            <div className="eyebrow">{report.scanType} scan · Base L2</div>
            <h1 className="mono mt-2 break-all text-lg font-semibold text-white sm:text-xl">
              {report.target}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>Scanned {formatRelative(report.scannedAt)}</span>
              {report.easUid && (
                <>
                  <span className="text-muted-faint">·</span>
                  <a
                    href={easAttestationUrl(report.easUid)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-brand hover:underline"
                  >
                    EAS attestation <ExternalLink size={12} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* gauge + signals */}
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="panel flex flex-col items-center p-8">
                <MeshScoreGauge score={report.meshScore} tier={report.tier} />
                <div className="mt-6 w-full border-t border-white/10 pt-5">
                  <div className="mb-3 text-center text-[11px] uppercase tracking-widest text-muted">
                    {report.signals.length} signals analyzed
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {(["critical", "high", "medium", "low", "none"] as Severity[]).map((sev) =>
                      counts[sev] > 0 ? (
                        <div key={sev} className="flex items-center justify-between">
                          <span className="capitalize text-muted">{sev}</span>
                          <span className="font-bold text-white">{counts[sev]}</span>
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
                <div
                  className="mt-5 w-full border px-3 py-2 text-center text-[11px] uppercase tracking-widest"
                  style={{ borderColor: `${color}55`, color }}
                >
                  {tierLabel(report.tier, report.meshScore)}
                </div>
              </div>
            </aside>

            <div className="space-y-10">
              {/* signals */}
              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
                  Risk signals
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sortedSignals.map((s, i) => (
                    <SignalCard key={`${s.name}-${i}`} signal={s} />
                  ))}
                </div>
              </section>

              {/* AI report */}
              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
                  AI risk report
                </h2>
                <div className="panel p-6 sm:p-8">
                  <AIReport markdown={report.reportMarkdown} />
                </div>
              </section>
            </div>
          </div>

          {/* attestation + badge */}
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <EASAttestationCard
              easUid={report.easUid}
              reportHash={report.reportHash}
              scannedAt={report.scannedAt}
            />
            <TrustBadgeEmbed target={report.target} uid={report.id} />
          </div>

          {/* rescan CTA */}
          <div className="no-print mt-12 flex flex-col items-center gap-4 border-t border-white/10 py-12 text-center">
            <h3 className="text-xl font-semibold text-white">Scan another target</h3>
            <Link href="/dashboard" className="btn-primary">
              New scan <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>
      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
