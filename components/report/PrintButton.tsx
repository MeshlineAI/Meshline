import { FileDown } from "lucide-react";
import { API_BASE } from "@/lib/api";

export function PrintButton({ uid }: { uid: string }) {
  return (
    <a
      href={`${API_BASE}/v1/report/${uid}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      download={`meshline-${uid}.pdf`}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted transition-colors hover:border-cyan-brand/40 hover:text-cyan-brand"
    >
      <FileDown size={14} /> PDF
    </a>
  );
}
