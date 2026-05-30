"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { reportShareUrl } from "@/lib/api";

interface Props {
  uid: string;
  score: number;
  tier: string;
}

export function SharePanel({ uid, score, tier }: Props) {
  const [copied, setCopied] = useState(false);
  const url = reportShareUrl(uid);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `MESH Score ${score} · ${tier} — onchain risk report by Meshline`,
  )}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 border border-white/10 bg-ink-700 px-3 py-2 text-xs text-muted transition-colors hover:border-cyan-brand/40 hover:text-cyan-brand"
      >
        {copied ? <Check size={14} className="text-acid" /> : <Link2 size={14} />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={tweet}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 border border-white/10 bg-ink-700 px-3 py-2 text-xs text-muted transition-colors hover:border-cyan-brand/40 hover:text-cyan-brand"
      >
        <Share2 size={14} /> Share
      </a>
    </div>
  );
}
