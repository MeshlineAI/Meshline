"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useWallet, type WalletOption } from "./WalletProvider";

function WalletIcon({ option }: { option: WalletOption }) {
  if (option.icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={option.icon} alt="" className="h-7 w-7 rounded-lg" />;
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">
      {option.name.charAt(0)}
    </span>
  );
}

export function WalletModal() {
  const { pickerOpen, closePicker, options, connectWith, connecting } = useWallet();

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePicker();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [pickerOpen, closePicker]);

  return (
    <AnimatePresence>
      {pickerOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            onClick={closePicker}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Connect a wallet"
            className="glass glass-strong relative z-10 w-full max-w-sm rounded-3xl p-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <button
              type="button"
              onClick={closePicker}
              className="glass absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-white"
              aria-label="Close"
            >
              <X size={15} />
            </button>

            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
              <ShieldCheck size={20} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Connect a wallet</h2>
            <p className="mt-1.5 text-sm text-muted">
              Choose a wallet to open your Meshline dashboard. We never move funds without your
              approval.
            </p>

            <div className="mt-5 space-y-2">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  disabled={connecting}
                  onClick={() => connectWith(opt)}
                  className="glass group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all hover:border-accent/40 disabled:opacity-50"
                >
                  <WalletIcon option={opt} />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-white">{opt.name}</span>
                    <span className="block text-[11px] text-muted">
                      {opt.installed ? "Detected" : "Not installed"}
                    </span>
                  </span>
                  {opt.installed ? (
                    <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
                  ) : (
                    <ArrowUpRight size={15} className="text-muted-faint group-hover:text-accent" />
                  )}
                </button>
              ))}
            </div>

            {connecting && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                <Loader2 size={13} className="animate-spin" /> Approve the connection in your
                wallet…
              </div>
            )}

            <p className="mt-5 text-center text-[11px] text-muted-faint">
              By connecting you agree to Meshline&apos;s terms. Base network (8453).
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
