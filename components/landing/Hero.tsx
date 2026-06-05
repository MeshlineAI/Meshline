"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Copy } from "lucide-react";
import { VideoBackground } from "@/components/ui/VideoBackground";
import { useWallet } from "@/components/wallet/WalletProvider";

const SIGNALS = [
  { name: "Source Verification", state: "Verified" },
  { name: "Proxy + Upgrade", state: "None" },
  { name: "Deployer History", state: "Clean" },
  { name: "Honeypot", state: "None" },
];

// Token contract address — drop the real 0x… CA in here at launch; until it
// starts with "0x" the hero shows a "Coming soon" placeholder slot instead.
const CONTRACT_ADDRESS = "Coming soon";
const CA_IS_LIVE = CONTRACT_ADDRESS.startsWith("0x");

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { address, openPicker } = useWallet();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const [caCopied, setCaCopied] = useState(false);
  const copyCa = () => {
    navigator.clipboard?.writeText(CONTRACT_ADDRESS);
    setCaCopied(true);
    setTimeout(() => setCaCopied(false), 1600);
  };

  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  // Scroll cue fades out the moment the page starts moving.
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <motion.div style={{ y: videoY, scale: videoScale }} className="absolute inset-0">
        <VideoBackground
          src="/videos/hero-mesh.mp4"
          poster="/videos/hero-mesh-poster.jpg"
          className="opacity-[0.34]"
          overlayClassName="bg-[radial-gradient(ellipse_at_60%_40%,transparent_0%,rgba(10,12,18,0.74)_55%,#0A0C12_100%)]"
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink via-transparent to-ink" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-mesh relative z-10 grid items-center gap-14 pt-32 pb-24 lg:grid-cols-12 lg:gap-8"
      >
        {/* headline column */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Onchain risk intelligence · Base L2
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            Trust, but{" "}
            <span className="text-gradient-flow">verify</span>
            <br />
            every address
            <br />
            on Base.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16 }}
            className="mt-7 max-w-md text-base leading-relaxed text-[#9aa6b6]"
          >
            Paste any Base contract, wallet, or app. Meshline reads the onchain risk, writes a clear
            report, and attests the result onchain — one MESH Score you can actually trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {address ? (
              <Link href="/dashboard" className="btn-primary">
                Open dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <button type="button" onClick={openPicker} className="btn-primary">
                Start scanning <ArrowRight size={16} />
              </button>
            )}
            <Link href="#how" className="btn-ghost">
              How it works
            </Link>
          </motion.div>

          {/* token contract address — copyable once CONTRACT_ADDRESS is live */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.26 }}
            className="mt-8"
          >
            {CA_IS_LIVE ? (
              <button
                type="button"
                onClick={copyCa}
                className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 font-mono text-[11px] transition-colors hover:border-accent/40 hover:bg-white/[0.05]"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-faint">CA</span>
                <span className="truncate text-white/80">{CONTRACT_ADDRESS}</span>
                {caCopied ? (
                  <Check size={13} className="shrink-0 text-accent" />
                ) : (
                  <Copy size={13} className="shrink-0 text-muted transition-colors group-hover:text-accent" />
                )}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/[0.07] px-4 py-2 font-mono text-[11px] shadow-[0_0_26px_-8px_rgba(0,229,255,0.45)]">
                <span className="text-[10px] uppercase tracking-[0.22em] text-accent">CA</span>
                <span className="h-3 w-px bg-white/15" />
                <span className="text-white/85">{CONTRACT_ADDRESS}</span>
                <span className="ml-1 h-1.5 w-1.5 shrink-0 animate-pulse-glow rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/[0.08] pt-6"
          >
            {[
              ["0–1000", "MESH Score"],
              ["~30s", "Per report"],
              ["EAS", "Onchain attested"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-lg font-semibold text-white">{v}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-faint">
                  {l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* report panel column */}
        <motion.div style={{ y: panelY }} className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-sm lg:ml-auto lg:mr-0"
          >
            {/* inner wrapper carries the idle float so it never fights the
                framer entrance/parallax transforms on the elements above. */}
            <div className="panel animate-glass-bob p-6">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-faint">
                Contract · Base
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Verified safe
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="font-display text-6xl font-semibold leading-none text-white">
                  924
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  MESH Score · AAA
                </div>
              </div>
              {/* thin ring gauge */}
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15.5}
                  initial={{ strokeDashoffset: 2 * Math.PI * 15.5 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 15.5 * (1 - 0.924) }}
                  transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </div>

            <div className="mt-6 divide-y divide-white/[0.06] border-t border-white/[0.06]">
              {SIGNALS.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <span className="text-[#9aa6b6]">{s.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-faint">
                    {s.state}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-faint">
                EAS · base.easscan.org
              </span>
              <ArrowUpRight size={14} className="text-muted" />
            </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* scroll cue — gentle hint that there's more below the fold */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-7 z-10 hidden flex-col items-center gap-2 sm:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-faint">
          Scroll
        </span>
        <span className="flex h-9 w-[22px] items-start justify-center rounded-full border border-white/15 p-1.5">
          <ChevronDown size={12} className="animate-scroll-cue text-accent" />
        </span>
      </motion.div>
    </section>
  );
}
