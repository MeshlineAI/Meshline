import Image from "next/image";
import { cn } from "@/lib/utils";
import logoMark from "./logo.png";

/* Mesh-node "M" logomark — diamond-lattice nodes in the brand cyan → mint →
   lime gradient. Raster mark (components/brand/logo.png); pairs with the
   MESHLINE wordmark in <Logo>. */

export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={logoMark}
      alt=""
      height={size}
      width={Math.round((size * logoMark.width) / logoMark.height)}
      className={cn("select-none", className)}
    />
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
