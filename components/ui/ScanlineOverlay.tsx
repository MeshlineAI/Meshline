import { cn } from "@/lib/utils";

/** Ambient backdrop — the logo gradient as a soft, drifting mesh of colour
    blooms (cyan → mint → lime) over the near-black base + video, with a whisper
    of grain. Export name kept for drop-in compatibility. */
export function ScanlineOverlay({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}>
      {/* brand gradient-mesh blooms */}
      <div className="absolute -top-[16%] left-[6%] h-[60vh] w-[60vh] rounded-full bg-[#00E5FF] opacity-[0.12] blur-[150px]" />
      <div className="absolute top-[26%] right-[0%] h-[54vh] w-[54vh] rounded-full bg-[#46E0B4] opacity-[0.10] blur-[160px]" />
      <div className="absolute bottom-[-12%] left-[28%] h-[50vh] w-[60vh] rounded-full bg-[#AEF73C] opacity-[0.07] blur-[180px]" />
      {/* faint top light + grain so flats don't read "AI-clean" */}
      <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(0,229,255,0.07),transparent_72%)]" />
      <div className="noise absolute inset-0 opacity-[0.025]" />
    </div>
  );
}
