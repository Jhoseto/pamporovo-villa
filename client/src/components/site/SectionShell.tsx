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
  darkOverlap?: boolean;
  splitTitle?: boolean;
  backgroundImage?: string;
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
  darkOverlap = false,
  splitTitle = false,
  backgroundImage,
}: SectionShellProps) {
  const hasBridge = overlap || darkOverlap;

  return (
    <section
      id={id}
      className={cn(
        "relative py-24 md:py-32",
        dark ? "immersive-section bg-[var(--ink)] text-white" : "bg-[var(--cream)]",
        backgroundImage && "overflow-hidden bg-transparent",
        overlap &&
          "relative z-[1] -mt-6 rounded-t-[1.75rem] shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.12)] sm:-mt-12 sm:rounded-t-[2.25rem] md:-mt-20 md:rounded-t-[2.5rem] md:shadow-[0_-40px_80px_-20px_rgba(0,0,0,0.15)]",
        darkOverlap &&
          "relative z-[1] -mt-6 rounded-t-[1.75rem] shadow-[0_-28px_64px_-20px_rgba(0,0,0,0.45)] sm:-mt-12 sm:rounded-t-[2.25rem] md:-mt-20 md:rounded-t-[2.5rem] md:shadow-[0_-48px_100px_-24px_rgba(0,0,0,0.55)]",
        className
      )}
    >
      {hasBridge && (
        <div
          className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent md:inset-x-12"
          aria-hidden
        />
      )}
      {backgroundImage && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
          <div
            className={cn(
              "absolute inset-0",
              dark ? "bg-[var(--ink)]/82" : "bg-[var(--cream)]/88"
            )}
          />
          <div
            className={cn(
              "absolute inset-0",
              dark
                ? "bg-gradient-to-b from-[var(--ink)]/50 via-transparent to-[var(--ink)]/75"
                : "bg-gradient-to-b from-[var(--cream)]/40 via-transparent to-[var(--cream)]/70"
            )}
          />
        </div>
      )}
      {dark && !backgroundImage && <div className="ambient-grid absolute inset-0 opacity-20" />}
      {dark && backgroundImage && (
        <div className="ambient-grid pointer-events-none absolute inset-0 z-[1] opacity-15" aria-hidden />
      )}
      <div className="container relative z-[1] mx-auto">
        <ScrollReveal className="mb-16 text-center md:mb-20">
          <p className={cn("eyebrow mb-4", dark ? "text-[var(--gold)]" : "text-primary")}>
            {eyebrow}
          </p>
          <h2
            className={cn(
              "font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl",
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
