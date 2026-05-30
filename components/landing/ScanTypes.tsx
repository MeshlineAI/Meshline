import Link from "next/link";
import { FileCode2, Wallet, Globe, ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const TYPES = [
  {
    icon: FileCode2,
    accent: "#00E5FF",
    name: "Contract Intel",
    count: "12 signals",
    price: "3 free · then 0.001 USDC",
    body: "Deep risk read of any Base contract.",
    signals: [
      "Source Verification",
      "Proxy + Upgrade",
      "Owner Privileges",
      "Deployer History",
      "Reentrancy",
      "Honeypot",
      "Liquidity Concentration",
      "Exploit Similarity",
      "CVE Exposure",
      "GitHub Disclosure",
      "Token Economics",
      "Age + Activity",
    ],
  },
  {
    icon: Wallet,
    accent: "#46E0B4",
    name: "Wallet Intel",
    count: "5 signals",
    price: "3 free · then 0.001 USDC",
    body: "Behavioral risk profile for any address.",
    signals: [
      "Approval Exposure",
      "Drainer Interactions",
      "MEV Activity",
      "Tx Patterns",
      "Protocol Fingerprint",
    ],
  },
  {
    icon: Globe,
    accent: "#AEF73C",
    name: "Base App Audit",
    count: "5 signals",
    price: "0.005 USDC",
    body: "Frontend + infra audit of any Base dApp.",
    signals: ["TLS", "Security Headers", "API Key Exposure", "Phishing Pattern", "CSP Policy"],
  },
];

export function ScanTypes() {
  return (
    <section id="scan-types" className="relative z-10 border-b border-white/10 py-24">
      <div className="container-mesh">
        <SectionHeading
          index="03"
          eyebrow="Scan types in depth"
          title={
            <>
              Three scan types. <span className="text-gradient">One action.</span>
            </>
          }
          description="Contract, wallet, or Base app — Meshline picks the right pipeline automatically and returns a MESH Score with a full breakdown."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {TYPES.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="panel group flex h-full flex-col p-7 transition-colors hover:border-white/20">
                <div className="mb-5 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border"
                    style={{ borderColor: `${t.accent}55`, color: t.accent, background: `${t.accent}0d` }}
                  >
                    <t.icon size={20} />
                  </div>
                  <span
                    className="mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest"
                    style={{ borderColor: `${t.accent}40`, color: t.accent }}
                  >
                    {t.count}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{t.body}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {t.signals.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#9fb3c9]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <span className="mono text-[11px] uppercase tracking-widest text-muted-faint">
                    {t.price}
                  </span>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                    style={{ color: t.accent }}
                  >
                    Open scanner <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
