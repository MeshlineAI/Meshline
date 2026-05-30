"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin top scroll-progress bar — subtle motion cue across the whole page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-gradient-to-r from-accent/0 via-accent to-accent-soft/0"
    />
  );
}
