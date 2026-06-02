"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DrawLineProps {
  className?: string;
  /** "x" draws left→right (horizontal rule), "y" draws top→bottom. */
  axis?: "x" | "y";
  delay?: number;
}

/** A brand-gradient hairline that "draws" itself in once scrolled into view.
    Great for section connectors and editorial dividers. Respects reduced
    motion via framer-motion's reduced-motion handling. */
export function DrawLine({ className, axis = "x", delay = 0 }: DrawLineProps) {
  const horizontal = axis === "x";
  return (
    <motion.div
      aria-hidden
      initial={{ scaleX: horizontal ? 0 : 1, scaleY: horizontal ? 1 : 0, opacity: 0 }}
      whileInView={{ scaleX: 1, scaleY: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        horizontal
          ? "h-px w-full origin-left bg-gradient-to-r from-transparent via-accent/45 to-transparent"
          : "w-px h-full origin-top bg-gradient-to-b from-transparent via-accent/45 to-transparent",
        className,
      )}
    />
  );
}
