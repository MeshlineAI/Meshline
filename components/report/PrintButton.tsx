"use client";

import { FileDown } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted transition-colors hover:border-cyan-brand/40 hover:text-cyan-brand"
    >
      <FileDown size={14} /> PDF
    </button>
  );
}
