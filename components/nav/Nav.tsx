"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/token", label: "Token", match: (p: string) => p.startsWith("/token") },
  { href: "/dashboard", label: "Dashboard", match: (p: string) => p.startsWith("/dashboard") },
];

const MOBILE = [...LINKS, { href: "/enterprise", label: "Enterprise", match: () => false }];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Liquid sliding indicator: follows hover, rests on the active route.
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeIndex = LINKS.findIndex((l) => l.match(pathname));
  const [hovered, setHovered] = useState<number | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number; show: boolean }>({
    left: 0,
    width: 0,
    show: false,
  });

  const movePill = useCallback(
    (index: number | null) => {
      const target = index ?? (activeIndex >= 0 ? activeIndex : null);
      const el = target == null ? null : itemRefs.current[target];
      const wrap = listRef.current;
      if (!el || !wrap) {
        setPill((p) => ({ ...p, show: false }));
        return;
      }
      const er = el.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      setPill({ left: er.left - wr.left, width: er.width, show: true });
    },
    [activeIndex],
  );

  useLayoutEffect(() => {
    movePill(hovered);
  }, [hovered, movePill, pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onResize = () => movePill(hovered);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [hovered, movePill]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full border pl-5 pr-2.5 transition-all duration-500",
          // Transparent over the page at the top; condenses into a glass pill on scroll.
          scrolled ? "glass py-2 shadow-glass-lg" : "border-transparent py-3",
        )}
        style={{ borderRadius: 999 }}
      >
        <Link href="/" aria-label="Meshline home" className="relative z-10 shrink-0">
          <Logo size={28} wordClassName="text-[17px]" />
        </Link>

        {/* center links with sliding glass indicator */}
        <div
          ref={listRef}
          className="relative z-10 hidden items-center lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          <motion.span
            aria-hidden
            className="glass-strong pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full"
            animate={{
              left: pill.left,
              width: pill.width,
              opacity: pill.show ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
            style={{ height: 40, borderRadius: 999 }}
          />
          {LINKS.map((l, i) => {
            const isActive = l.match(pathname);
            return (
              <Link
                key={l.label}
                href={l.href}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onMouseEnter={() => setHovered(i)}
                className={cn(
                  "relative z-10 rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors duration-200",
                  isActive || hovered === i ? "text-white" : "text-muted hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-2">
          <ConnectWallet className="hidden text-sm sm:inline-flex" />
          <button
            type="button"
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      {open && (
        <div className="absolute inset-x-4 top-full mt-2 lg:hidden">
          <div className="glass glass-strong rounded-3xl p-3">
            <div className="flex flex-col">
              {MOBILE.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm transition-colors",
                    l.match(pathname)
                      ? "bg-white/[0.06] text-white"
                      : "text-muted hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-2 px-1">
              <ConnectWallet className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
