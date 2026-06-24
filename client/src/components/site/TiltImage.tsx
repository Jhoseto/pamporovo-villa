import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TiltImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  maxTilt?: number;
  children?: ReactNode;
  onClick?: () => void;
};

export function TiltImage({
  src,
  alt,
  className,
  imageClassName,
  maxTilt = 10,
  children,
  onClick,
}: TiltImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 22 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 22 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(x * maxTilt);
    rotateX.set(-y * maxTilt);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        onClick && "cursor-pointer"
      )}
    >
      <motion.div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        style={
          reducedMotion
            ? undefined
            : {
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
              }
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={src}
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
          loading="lazy"
        />
        {children}
      </motion.div>
    </Wrapper>
  );
}
