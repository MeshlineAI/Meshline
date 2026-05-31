"use client";

// EAS attestation is now written in the background *after* a scan returns, so
// `easUid` is null on a fresh report (frontend-integration.md). This card polls
// GET /v1/report/:uid until the attestation lands, shows an "attestation pending"
// state meanwhile, and refreshes the server-rendered page so the header link
// backfills too.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { easAttestationUrl, getReport } from "@/lib/api";
import { truncateMiddle } from "@/lib/utils";

interface Props {
  uid: string;
  easUid: string;
  reportHash: string;
  scannedAt: number;
}

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 8; // ~32s — attestation typically lands within seconds

export function EASAttestationCard({ uid, easUid: initialEasUid, reportHash, scannedAt }: Props) {
  const router = useRouter();
  const [easUid, setEasUid] = useState(initialEasUid);
  const polls = useRef(0);

  useEffect(() => {
    if (easUid || !uid) return; // already attested — nothing to poll for
    let cancelled = false;
    const id = setInterval(async () => {
      if (polls.current >= MAX_POLLS) {
        clearInterval(id);
        return;
      }
      polls.current += 1;
      try {
        const r = await getReport(uid);
        if (!cancelled && r.easUid) {
          clearInterval(id);
          setEasUid(r.easUid);
          router.refresh(); // re-render the server page so the header link backfills
        }
      } catch {
        /* transient — keep polling */
      }
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [easUid, uid, router]);

  const pending = !easUid;
  const when = scannedAt
    ? new Date(scannedAt < 1e12 ? scannedAt * 1000 : scannedAt).toUTCString()
    : "—";

  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <ShieldCheck size={16} className="text-cyan-brand" />
        Onchain attestation
      </div>
      <p className="mt-1.5 text-xs text-muted">
        This result is permanently attested on Base via EAS — independently verifiable by anyone.
      </p>

      <dl className="mt-5 space-y-3 text-xs">
        <Row
          label="EAS UID"
          value={pending ? "pending…" : truncateMiddle(easUid, 10, 8)}
          title={easUid || undefined}
          dim={pending}
        />
        <Row label="Report hash" value={truncateMiddle(reportHash, 10, 8)} title={reportHash} />
        <Row label="Scanned at" value={when} />
      </dl>

      {pending ? (
        <div className="mt-5 inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-xs text-muted">
          <Loader2 size={13} className="animate-spin text-cyan-brand" />
          Attestation pending — writing to Base…
        </div>
      ) : (
        <a
          href={easAttestationUrl(easUid)}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 border border-cyan-brand/40 px-4 py-2 text-xs font-bold text-cyan-brand transition-colors hover:bg-cyan-brand/10"
        >
          View on EASScan <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  title,
  dim,
}: {
  label: string;
  value: string;
  title?: string;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-mono uppercase tracking-widest text-muted-faint">{label}</dt>
      <dd
        className={`mono truncate font-medium ${dim ? "text-muted-faint" : "text-[#c2d2e4]"}`}
        title={title}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
