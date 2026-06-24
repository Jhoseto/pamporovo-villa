import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  mode?: "char" | "word";
  as?: "span" | "div" | "h1" | "h2" | "p";
};

export function SplitText({
  text,
  className,
  delay = 0,
  mode = "char",
  as: Tag = "span",
}: SplitTextProps) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const units = mode === "word" ? text.split(" ") : text.split("");

  return (
    <Tag className={cn("inline-flex flex-wrap justify-center", className)} aria-label={text}>
      {units.map((unit, i) => {
        const content = mode === "word" ? (i < units.length - 1 ? `${unit}\u00A0` : unit) : unit;
        const isSpace = mode === "char" && unit === " ";

        return (
          <motion.span
            key={`${unit}-${i}`}
            className="inline-block"
            initial={{ opacity: 0, y: isSpace ? 0 : 48, rotateX: isSpace ? 0 : 40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * (mode === "word" ? 0.08 : 0.035),
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformPerspective: 800,
              whiteSpace: mode === "char" && isSpace ? "pre" : undefined,
            }}
          >
            {isSpace ? "\u00A0" : content}
          </motion.span>
        );
      })}
    </Tag>
  );
}
