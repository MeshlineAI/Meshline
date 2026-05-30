"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { cn } from "@/lib/utils";

interface ConnectCTAProps {
  className?: string;
  variant?: "primary" | "ghost";
  connectLabel?: string;
  dashboardLabel?: string;
}

/** Smart CTA: prompts wallet connect when disconnected, links to the
    dashboard (where scanning lives) once connected. */
export function ConnectCTA({
  className,
  variant = "primary",
  connectLabel = "Start scanning",
  dashboardLabel = "Open dashboard",
}: ConnectCTAProps) {
  const { address, openPicker } = useWallet();
  const cls = cn(variant === "primary" ? "btn-primary" : "btn-ghost", className);

  if (address) {
    return (
      <Link href="/dashboard" className={cls}>
        {dashboardLabel} <ArrowRight size={16} />
      </Link>
    );
  }
  return (
    <button type="button" onClick={openPicker} className={cls}>
      {connectLabel} <ArrowRight size={16} />
    </button>
  );
}
