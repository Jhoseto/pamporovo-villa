import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MagneticButtonProps = ComponentProps<typeof Button> & {
  children: ReactNode;
  strength?: number;
};

export function MagneticButton({
  children,
  className,
  strength = 0.35,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 280, damping: 22, mass: 0.6 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((event.clientX - centerX) * strength);
    y.set((event.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isFullWidth = className?.includes("w-full");
  const hasResponsiveWidth = /\b(?:sm|md|lg|xl|2xl):w-auto\b/.test(className ?? "");

  const wrapperClassName = cn(
    isFullWidth && hasResponsiveWidth && "block w-full sm:inline-block sm:w-auto",
    isFullWidth && !hasResponsiveWidth && "block w-full",
    !isFullWidth && "inline-block"
  );

  if (reducedMotion) {
    return (
      <Button className={cn(className)} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={wrapperClassName}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Button className={cn(className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
