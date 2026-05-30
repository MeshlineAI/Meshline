import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <div className="mt-10 text-7xl font-bold text-accent">404</div>
      <h1 className="mt-4 text-xl font-bold text-white">Report not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This scan UID doesn&apos;t exist, or the address was never scanned. Open your dashboard to
        run a fresh scan and generate a permanent report.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/dashboard" className="btn-primary">
          Open dashboard →
        </Link>
        <Link href="/" className="btn-ghost">
          Back home
        </Link>
      </div>
    </main>
  );
}
