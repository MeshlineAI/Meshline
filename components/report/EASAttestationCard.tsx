import { ExternalLink, ShieldCheck } from "lucide-react";
import { easAttestationUrl } from "@/lib/api";
import { truncateMiddle } from "@/lib/utils";

interface Props {
  easUid: string;
  reportHash: string;
  scannedAt: number;
}

export function EASAttestationCard({ easUid, reportHash, scannedAt }: Props) {
  const when = scannedAt
    ? new Date((scannedAt < 1e12 ? scannedAt * 1000 : scannedAt)).toUTCString()
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
        <Row label="EAS UID" value={truncateMiddle(easUid, 10, 8)} title={easUid} />
        <Row label="Report hash" value={truncateMiddle(reportHash, 10, 8)} title={reportHash} />
        <Row label="Scanned at" value={when} />
      </dl>

      {easUid && (
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

function Row({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-mono uppercase tracking-widest text-muted-faint">{label}</dt>
      <dd className="mono truncate font-medium text-[#c2d2e4]" title={title}>
        {value || "—"}
      </dd>
    </div>
  );
}
