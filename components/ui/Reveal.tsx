"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  /** Travel distance in px. */
  distance?: number;
  direction?: Direction;
  /** Add a subtle blur-in for a softer, more premium entrance. */
  blur?: boolean;
}

function offset(direction: Direction, d: number) {
  switch (direction) {
    case "up":
      return { y: d };
    case "down":
      return { y: -d };
    case "left":
      return { x: d };
    case "right":
      return { x: -d };
    default:
      return {};
  }
}

/** Fade + travel into view once. Respects reduced motion via framer-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 22,
  direction = "up",
  blur = false,
  ...props
}: RevealProps) {
  const from = offset(direction, distance);
  return (
    <motion.div
      initial={{ opacity: 0, ...from, ...(blur ? { filter: "blur(8px)" } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
