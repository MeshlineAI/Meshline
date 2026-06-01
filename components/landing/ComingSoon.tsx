"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { VideoBackground } from "@/components/ui/VideoBackground";
import { ScanlineOverlay } from "@/components/ui/ScanlineOverlay";

const BUILT_ON = ["Base L2", "x402", "EAS"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Coming-soon screen — a deliberately stripped-back take on the landing page.
   Same brand language (hero video, gradient-mesh blooms, glass) but a single
   centered message + waitlist capture instead of the full marketing scroll. */
export function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      return;
    }
    // TODO: wire to a real waitlist endpoint — this only confirms locally.
    setStatus("done");
  }

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* shared brand backdrop: hero video + drifting gradient-mesh blooms */}
      <motion.div
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <VideoBackground
          src="/videos/hero-mesh.mp4"
          poster="/videos/hero-mesh-poster.jpg"
          className="opacity-[0.32]"
          overlayClassName="bg-[radial-gradient(ellipse_at_50%_38%,transparent_0%,rgba(10,12,18,0.78)_55%,#0A0C12_100%)]"
        />
      </motion.div>
      <ScanlineOverlay />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink via-transparent to-ink" />

      {/* minimal top bar — just the mark */}
      <header className="relative z-10 flex justify-center px-6 pt-8 sm:justify-start sm:px-10">
        <Logo size={28} wordClassName="text-[17px]" />
      </header>

      {/* centered hero block */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
          >
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-accent" />
            Coming soon · Base L2
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 font-display text-[clamp(2.6rem,8vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            Trust, but{" "}
            <span className="text-gradient">verify.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16 }}
            className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#9aa6b6]"
          >
            One MESH Score for every address on Base — onchain risk intelligence,
            attested onchain. Almost here.
          </motion.p>

          {/* waitlist capture */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mx-auto mt-9 max-w-md"
          >
            {status === "done" ? (
              <div className="panel flex items-center justify-center gap-2.5 px-6 py-4 text-sm text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check size={14} />
                </span>
                You&apos;re on the list — we&apos;ll be in touch at launch.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="you@wallet.xyz"
                  aria-label="Email address"
                  aria-invalid={status === "error"}
                  className="h-12 flex-1 rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm text-white outline-none transition-colors placeholder:text-muted-faint focus:border-accent/50"
                />
                <button type="submit" className="btn-primary h-12 shrink-0">
                  Notify me <ArrowRight size={16} />
                </button>
              </form>
            )}
            <p
              className={`mt-3 text-xs ${
                status === "error" ? "text-tier-c" : "text-muted-faint"
              }`}
            >
              {status === "error"
                ? "Enter a valid email address."
                : "Be first to scan when we go live. No spam."}
            </p>
          </motion.div>

          {/* built-on chips — the only "spec" we keep */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {BUILT_ON.map((b) => (
              <span
                key={b}
                className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
              >
                {b}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* minimal footer line */}
      <footer className="relative z-10 flex flex-col items-center gap-2 px-6 pb-8 text-xs text-muted-faint sm:flex-row sm:justify-between sm:px-10">
        <span>© {new Date().getFullYear()} Meshline · Built on Base L2</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
          Launching soon
        </span>
      </footer>
    </section>
  );
}
