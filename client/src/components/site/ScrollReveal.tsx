import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
};

const directionOffset = {
  up: { y: 48, x: 0 },
  left: { y: 0, x: -48 },
  right: { y: 0, x: 48 },
  none: { y: 0, x: 0 },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Reduced margin so lazy-loaded content that's already in view on mount
  // (e.g. BookingSection after scroll) still triggers the entrance animation.
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const reducedMotion = useReducedMotion();
  const offset = directionOffset[direction];

  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      initial={{
        opacity: 0,
        y: offset.y,
        x: offset.x,
        rotateX: direction === "up" ? 8 : 0,
        scale: 0.96,
      }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0, rotateX: 0, scale: 1 }
          : {
              opacity: 0,
              y: offset.y,
              x: offset.x,
              rotateX: direction === "up" ? 8 : 0,
              scale: 0.96,
            }
      }
      transition={{
        duration: 0.9,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}
