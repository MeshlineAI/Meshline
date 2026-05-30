"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function ReportError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <div className="mt-10 text-5xl font-bold text-tier-bb">⚠</div>
      <h1 className="mt-4 text-xl font-bold text-white">Couldn&apos;t load this report</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The Meshline backend didn&apos;t respond in time. This can happen on a cold start — give it
        a moment and try again.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-cyan-brand px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-acid"
        >
          Retry
        </button>
        <Link
          href="/"
          className="border border-white/15 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-brand/50"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
