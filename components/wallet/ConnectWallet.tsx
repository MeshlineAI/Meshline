"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, LogOut, Copy, Check, LayoutDashboard, AlertTriangle } from "lucide-react";
import { useWallet } from "./WalletProvider";
import { truncateMiddle, cn } from "@/lib/utils";

export function ConnectWallet({ className }: { className?: string }) {
  const { address, connecting, onBase, openPicker, switchToBase, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!address) {
    return (
      <button
        type="button"
        onClick={openPicker}
        disabled={connecting}
        className={cn("btn-primary px-5 py-2.5 text-sm", className)}
      >
        <Wallet size={15} />
        {connecting ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all hover:border-accent/40"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            onBase ? "bg-accent shadow-[0_0_8px] shadow-accent" : "bg-tier-bb",
          )}
        />
        <span className="mono">{truncateMiddle(address, 6, 4)}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="glass glass-strong absolute right-0 z-50 mt-2 w-52 rounded-2xl p-1.5">
            {!onBase && (
              <button
                type="button"
                onClick={() => {
                  switchToBase();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-tier-bb transition-colors hover:bg-white/5"
              >
                <AlertTriangle size={13} /> Switch to Base
              </button>
            )}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard size={13} /> Dashboard
            </Link>
            <button
              type="button"
              onClick={copy}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy address"}
            </button>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-tier-c"
            >
              <LogOut size={13} /> Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
