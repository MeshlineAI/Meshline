import { Logo } from "@/components/brand/Logo";

const BUILT_ON = ["Base L2", "x402", "EAS", "OnchainKit", "Agentic Wallets"];

const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/meshlinebase",
    // Telegram glyph
    path: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  },
  {
    label: "X",
    href: "https://x.com/meshlinebase",
    // X (Twitter) glyph
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.063-6.933Zm-1.291 19.51h2.039L6.486 3.24H4.298l13.312 17.422Z",
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-ink-900">
      <div className="container-mesh py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* brand */}
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
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

          {/* community / socials */}
          <div className="md:text-right">
            <h4 className="eyebrow mb-4">Join the community</h4>
            <div className="flex gap-3 md:justify-end">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted transition-colors hover:border-accent/40 hover:bg-white/[0.05] hover:text-accent"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[18px] w-[18px]">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-muted-faint sm:flex-row sm:items-center sm:justify-between">
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
