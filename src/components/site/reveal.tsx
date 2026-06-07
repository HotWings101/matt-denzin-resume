"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Animate on scroll into view (default) or immediately on mount. */
  onMount?: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

/** Subtle staggered entrance used across sections. Respects reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
  onMount = false,
}: RevealProps) {
  const animateProps = onMount
    ? { animate: { opacity: 1, y: 0 } }
    : {
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
      };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...animateProps}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
