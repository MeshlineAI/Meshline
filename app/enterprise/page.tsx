import type { Metadata } from "next";
import {
  ShieldHalf,
  Boxes,
  KeyRound,
  FileCheck2,
  Users,
  Activity,
  ArrowRight,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Private Base app audits, bulk API, SSO, SOC2 export, SLA, and a dedicated Slack — onchain risk intelligence for teams.",
};

const FEATURES = [
  { icon: ShieldHalf, title: "Private app audits", body: "Confidential, full-depth audits of your Base dApp — frontend, infra, and connected contracts." },
  { icon: Boxes, title: "Bulk API", body: "Scan your entire portfolio or contract registry in one call. 0.0005 USDC/address, ≤50 per batch." },
  { icon: KeyRound, title: "SSO", body: "SAML / OIDC single sign-on for your whole security team, with role-based access." },
  { icon: FileCheck2, title: "SOC2 export", body: "Export attested scan history and evidence packs for compliance and audits." },
  { icon: Users, title: "Team management", body: "Seats, roles, shared scan history, and per-project workspaces." },
  { icon: Activity, title: "SLA + monitoring", body: "99.9% uptime SLA, sub-5-minute alerting, and a dedicated Slack channel." },
];

const SLA = [
  { label: "Uptime SLA", value: "99.9%" },
  { label: "Alert latency", value: "<5 min" },
  { label: "Support", value: "Dedicated Slack" },
  { label: "Audit retention", value: "Permanent" },
];

export default function EnterprisePage() {
  return (
    <PageShell>
      <div className="pb-24">
        <PageHeader
          eyebrow="Enterprise · $199/mo"
          title={
            <>
              Onchain risk intelligence, <span className="text-gradient">for teams.</span>
            </>
          }
          description="Everything in Pro, plus private audits, bulk scanning, SSO, SOC2 exports, and an SLA. Built for protocols, funds, and security teams operating on Base."
        />

        <div className="container-mesh mt-8 flex flex-wrap gap-3">
          <a href="mailto:sales@meshline.tech?subject=Meshline%20Enterprise" className="btn-primary">
            Talk to sales <ArrowRight size={15} />
          </a>
          <a href="mailto:sales@meshline.tech?subject=Meshline%20Enterprise%20Demo" className="btn-ghost">
            Book a demo
          </a>
        </div>

        {/* SLA strip */}
        <div className="container-mesh mt-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SLA.map((s) => (
              <div key={s.label} className="panel p-5 text-center">
                <div className="mono text-xl font-semibold text-cyan-brand">{s.value}</div>
                <div className="eyebrow mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* features */}
        <div className="container-mesh mt-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="panel panel-hover h-full p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-brand/30 bg-cyan-brand/5 text-cyan-brand">
                    <f.icon size={18} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* contact CTA */}
        <div className="container-mesh mt-16">
          <div className="panel relative overflow-hidden p-10 text-center">
            <div className="grid-dots pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white">
                Make Meshline your <span className="text-gradient">safety layer.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted">
                Partner with us — &lsquo;Scan this contract before depositing&rsquo; integrations,
                bulk monitoring, and compliance exports for your whole organization.
              </p>
              <a
                href="mailto:sales@meshline.tech?subject=Meshline%20Enterprise"
                className="btn-primary mt-7"
              >
                Contact sales <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
