import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const BUILT_ON = ["Base L2", "x402", "EAS", "OnchainKit", "Agentic Wallets"];

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Scan types", href: "/#scan-types" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "For agents", href: "/#agents" },
      { label: "MESH Token", href: "/token" },
      { label: "Enterprise", href: "/enterprise" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "EAS attestations", href: "https://base.easscan.org" },
      { label: "x402 Bazaar", href: "https://x402.org" },
      { label: "Agent.market", href: "https://agent.market" },
      { label: "Base", href: "https://base.org" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-ink-900">
      <div className="container-mesh py-16">
        <div className="grid gap-12 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              AI-powered onchain risk intelligence for Base. Scan any contract, wallet, or app —
              get a MESH Score, EAS-attested, in 30 seconds.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {BUILT_ON.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-muted-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Meshline · Built on Base L2</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
