import { cn } from "@/lib/utils";

/* Mesh-node "M" logomark — diamond-lattice nodes + edges, the brand cyan →
   mint → lime gradient, prominent bottom-centre node and outer tails with
   lone dots. Matches app/icon.svg. */

type N = [number, number, number]; // x, y, r
const NODES: N[] = [
  // left tower
  [66, 18, 4.2], [51, 33, 3.6], [81, 33, 3.6],
  [36, 48, 3.2], [66, 48, 3.6], [96, 48, 3.2],
  // right tower (mirror of left about x=100)
  [134, 18, 4.2], [149, 33, 3.6], [119, 33, 3.6],
  [164, 48, 3.2], [134, 48, 3.6], [104, 48, 3.2],
  // centre valley + big bottom node
  [100, 40, 3.0], [88, 56, 3.2], [112, 56, 3.2], [100, 72, 3.6], [100, 90, 6.6],
  // left tail + lone dot
  [28, 66, 3.2], [20, 84, 3.0], [13, 104, 2.4],
  // right tail + lone dot
  [172, 66, 3.2], [180, 84, 3.0], [187, 104, 2.4],
];

type E = [number, number]; // indices into NODES
const EDGES: E[] = [
  // left tower diamonds
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
  // right tower diamonds
  [6, 7], [6, 8], [7, 9], [7, 10], [8, 10], [8, 11],
  // towers → centre valley
  [2, 12], [8, 12], [5, 13], [11, 14], [12, 13], [12, 14], [13, 15], [14, 15], [15, 16],
  // left tail
  [3, 17], [17, 18],
  // right tail
  [9, 20], [20, 21],
];

export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  const gid = "mesh-logo-grad";
  const h = size;
  const w = Math.round((size * 200) / 116);
  return (
    <svg
      height={h}
      width={w}
      viewBox="0 0 200 116"
      fill="none"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="100" y1="14" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00E5FF" />
          <stop offset="0.5" stopColor="#46E0B4" />
          <stop offset="1" stopColor="#AEF73C" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gid})`} strokeWidth="1.6" strokeLinecap="round" opacity="0.78">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      <g fill={`url(#${gid})`}>
        {NODES.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

export function Logo({
  className,
  size = 24,
  wordClassName = "text-[15px]",
}: {
  className?: string;
  size?: number;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className={cn("font-bold tracking-[0.18em] text-white", wordClassName)}>
        MESH<span className="text-gradient">LINE</span>
      </span>
    </span>
  );
}
