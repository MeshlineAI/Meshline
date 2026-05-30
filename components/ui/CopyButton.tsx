"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-2 border border-white/10 bg-ink-700 px-3 py-2 text-xs text-muted transition-colors hover:border-cyan-brand/40 hover:text-cyan-brand",
        className,
      )}
    >
      {copied ? <Check size={14} className="text-acid" /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}
