"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionStyle } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /** Positive moves slower (drifts up as you scroll past). Range ~ -120..120 px. */
  offset?: number;
  /** Optional opacity/scale fade tied to scroll progress. */
  fade?: boolean;
  style?: MotionStyle;
}

/** Scroll-linked vertical parallax. Wrap any block to give it depth on scroll. */
export function Parallax({ children, className, offset = 60, fade = false, style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0.4, 1, 1, 0.4]);

  return (
    <motion.div
      ref={ref}
      style={{ y, ...(fade ? { opacity } : {}), ...style }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
