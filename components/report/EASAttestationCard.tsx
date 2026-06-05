"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { easAttestationUrl, submitAttestation } from "@/lib/api";
import { truncateMiddle } from "@/lib/utils";
import { useWallet } from "@/components/wallet/WalletProvider";

interface Props {
  uid: string;
  easUid: string;
  easPayload: { to: string; data: string } | null;
  reportHash: string;
  scannedAt: number;
}

export function EASAttestationCard({ uid, easUid: initialEasUid, easPayload, reportHash, scannedAt }: Props) {
  const router = useRouter();
  const [easUid, setEasUid] = useState(initialEasUid);
  const [attesting, setAttesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, onBase, provider, openPicker, switchToBase } = useWallet();

  const handleAttest = async () => {
    if (!provider || !address || !easPayload) return;
    setAttesting(true);
    setError(null);
    try {
      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: easPayload.to,
            data: easPayload.data,
            value: "0x0",
          },
        ],
      })) as string;

      setAttesting(false);
      setSubmitting(true);

      const result = await submitAttestation(uid, txHash);
      if (result.success && result.easUid) {
        setEasUid(result.easUid);
        router.refresh();
      } else {
        setError("Attestation verification failed.");
      }
    } catch (err: any) {
      console.error("[eas] attestation error:", err);
      setError(err?.message ?? "Transaction rejected or failed.");
    } finally {
      setAttesting(false);
      setSubmitting(false);
    }
  };

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
          value={pending ? "Not attested yet" : truncateMiddle(easUid, 10, 8)}
          title={easUid || undefined}
          dim={pending}
        />
        <Row label="Report hash" value={truncateMiddle(reportHash, 10, 8)} title={reportHash} />
        <Row label="Scanned at" value={when} />
      </dl>

      {error && (
        <p className="mt-3 text-xs text-red-400">
          {error}
        </p>
      )}

      {pending ? (
        <div className="mt-5 flex flex-col items-start gap-3">
          {address === null ? (
            <button
              onClick={openPicker}
              className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10 cursor-pointer"
            >
              <Wallet size={13} /> Connect Wallet to Attest
            </button>
          ) : !onBase ? (
            <button
              onClick={switchToBase}
              className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10 cursor-pointer"
            >
              Switch to Base to Attest
            </button>
          ) : (
            <button
              onClick={handleAttest}
              disabled={attesting || submitting || !easPayload}
              className="inline-flex items-center gap-2 border border-cyan-brand/40 px-4 py-2 text-xs font-bold text-cyan-brand transition-colors hover:bg-cyan-brand/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {(attesting || submitting) && <Loader2 size={13} className="animate-spin text-cyan-brand" />}
              {attesting
                ? "Approve in Wallet..."
                : submitting
                ? "Verifying Attestation..."
                : "Attest on Base"}
            </button>
          )}
          <span className="text-[10px] text-muted-faint">
            Attesting writes this report directly to Base. Gas fee paid via your wallet.
          </span>
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

