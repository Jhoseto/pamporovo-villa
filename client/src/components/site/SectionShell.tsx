import type { ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";
import { SplitText } from "./SplitText";
import { cn } from "@/lib/utils";

type SectionShellProps = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  overlap?: boolean;
  splitTitle?: boolean;
};

export function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  dark = false,
  overlap = false,
  splitTitle = false,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-24 md:py-32",
        dark ? "immersive-section bg-[var(--ink)] text-white" : "bg-[var(--cream)]",
        overlap && "-mt-20 rounded-t-[2.5rem] shadow-[0_-40px_80px_-20px_rgba(0,0,0,0.15)]",
        className
      )}
    >
      {dark && <div className="ambient-grid absolute inset-0 opacity-20" />}
      <div className="container relative mx-auto">
        <ScrollReveal className="mb-16 text-center md:mb-20">
          <p className={cn("eyebrow mb-4", dark ? "text-[var(--gold)]" : "text-primary")}>
            {eyebrow}
          </p>
          <h2
            className={cn(
              "font-serif text-4xl font-bold md:text-5xl lg:text-6xl",
              dark ? "text-white" : "text-foreground"
            )}
          >
            {splitTitle ? (
              <SplitText
                as="span"
                mode="word"
                text={title}
                className="w-full justify-center"
                delay={0.1}
              />
            ) : (
              title
            )}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "mx-auto mt-4 max-w-2xl text-lg",
                dark ? "text-white/60" : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          )}
        </ScrollReveal>
        {children}
      </div>
    </section>
  );
}
