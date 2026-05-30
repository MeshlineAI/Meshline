"use client";

import { motion } from "framer-motion";

/** Page-transition wrapper — runs on every route change for a smooth
    cross-page fade. Intentionally opacity-only: the page tree contains
    `position: fixed` elements (Nav, scroll bar), and animating transform
    or filter here would create a containing block and break them. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
