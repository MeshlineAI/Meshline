import { badgeUrl, reportShareUrl } from "@/lib/api";
import { CopyButton } from "@/components/ui/CopyButton";

interface Props {
  target: string;
  uid: string;
}

export function TrustBadgeEmbed({ target, uid }: Props) {
  const src = badgeUrl(target);
  const href = reportShareUrl(uid);
  const snippet = `<a href="${href}">
  <img src="${src}" alt="Meshline Security Score" />
</a>`;

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Embed your trust badge</h3>
          <p className="mt-1 text-xs text-muted">
            Drop this on your site or README — it auto-updates from the latest EAS attestation.
          </p>
        </div>
        <CopyButton value={snippet} label="Copy embed" />
      </div>

      {/* live badge preview */}
      <div className="mt-5 flex items-center justify-center border border-white/10 bg-ink p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Meshline Security Score" className="max-h-16" />
      </div>

      <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-ink-900 p-4 font-mono text-[11.5px] leading-relaxed text-[#c2d2e4]">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
