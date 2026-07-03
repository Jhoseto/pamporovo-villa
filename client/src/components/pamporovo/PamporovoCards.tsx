import type { Attraction, Piste, PisteDifficulty } from "@/data/pamporovoContent";
import { TiltImage } from "@/components/site/TiltImage";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { useGuideDifficultyLabels, useGuideUi } from "@/i18n/guideHooks";
import { cn } from "@/lib/utils";

const DIFFICULTY_CLASS: Record<PisteDifficulty, string> = {
  green: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
  blue: "bg-sky-500/15 text-sky-900 border-sky-500/30",
  red: "bg-rose-500/15 text-rose-900 border-rose-500/30",
  black: "bg-neutral-900/90 text-white border-neutral-700",
};

export function AttractionCard({
  item,
  dark = false,
  large = false,
}: {
  item: Attraction;
  dark?: boolean;
  large?: boolean;
}) {
  return (
    <ScrollReveal direction="up">
      <article
        className={cn(
          "group overflow-hidden rounded-2xl border transition-shadow duration-500 hover:shadow-xl",
          dark
            ? "border-white/10 bg-white/[0.04] hover:border-[var(--gold)]/30"
            : "border-black/8 bg-white hover:border-[var(--gold)]/40"
        )}
      >
        <TiltImage
          src={item.image}
          alt={item.title}
          className={cn("aspect-[16/10]", large && "md:aspect-[21/9]")}
          maxTilt={6}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--gold-light)]">
              {item.distance}
              {item.duration ? ` · ${item.duration}` : ""}
            </p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-white md:text-2xl">{item.title}</h3>
          </div>
        </TiltImage>
        <div className="space-y-4 p-5 md:p-6">
          <p className={cn("text-sm leading-relaxed", dark ? "text-white/70" : "text-muted-foreground")}>
            {item.description}
          </p>
          <ul className="flex flex-wrap gap-2">
            {item.highlights.map(h => (
              <li
                key={h}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs tracking-wide",
                  dark ? "border-white/15 text-white/80" : "border-black/10 text-foreground/80"
                )}
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </ScrollReveal>
  );
}

export function PisteTable({ pistes, dark = false }: { pistes: Piste[]; dark?: boolean }) {
  const ui = useGuideUi();
  const difficultyLabels = useGuideDifficultyLabels();

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border",
        dark ? "border-white/10 bg-white/[0.03]" : "border-black/8 bg-white"
      )}
    >
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className={cn("border-b", dark ? "border-white/10 text-white/60" : "border-black/8 text-muted-foreground")}>
            <th className="px-4 py-3 font-medium">{ui.pisteNumber}</th>
            <th className="px-4 py-3 font-medium">{ui.pisteName}</th>
            <th className="px-4 py-3 font-medium">{ui.difficulty}</th>
            <th className="px-4 py-3 font-medium">{ui.length}</th>
            <th className="px-4 py-3 font-medium">{ui.note}</th>
          </tr>
        </thead>
        <tbody>
          {pistes.map(p => (
            <tr
              key={p.number + p.name}
              className={cn("border-b last:border-0", dark ? "border-white/5 text-white/85" : "border-black/5")}
            >
              <td className="px-4 py-3 font-display tracking-wide">{p.number}</td>
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-block rounded-full border px-2.5 py-0.5 text-xs",
                    DIFFICULTY_CLASS[p.difficulty]
                  )}
                >
                  {difficultyLabels[p.difficulty]}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {p.lengthM} {ui.meters}
              </td>
              <td className={cn("px-4 py-3 text-xs", dark ? "text-white/55" : "text-muted-foreground")}>
                {p.note ?? ui.dash}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { LiftFact } from "@shared/pamporovoSkiData";

export function LiftTable({ lifts, dark = false }: { lifts: LiftFact[]; dark?: boolean }) {
  const ui = useGuideUi();

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border",
        dark ? "border-white/10 bg-white/[0.03]" : "border-black/8 bg-white"
      )}
    >
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className={cn("border-b", dark ? "border-white/10 text-white/60" : "border-black/8 text-muted-foreground")}>
            <th className="px-4 py-3 font-medium">{ui.route}</th>
            <th className="px-4 py-3 font-medium">{ui.liftType}</th>
            <th className="px-4 py-3 font-medium">{ui.length}</th>
            <th className="px-4 py-3 font-medium">{ui.capacityPerHour}</th>
          </tr>
        </thead>
        <tbody>
          {lifts.map((lift) => (
            <tr
              key={lift.route}
              className={cn("border-b last:border-0", dark ? "border-white/5 text-white/85" : "border-black/5")}
            >
              <td className="px-4 py-3 font-medium">{lift.route}</td>
              <td className="px-4 py-3">{lift.type}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {lift.lengthM} {ui.meters}
              </td>
              <td className="px-4 py-3">{lift.capacity.toLocaleString("bg-BG")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatGrid({
  stats,
  dark = false,
}: {
  stats: { value: string; label: string }[];
  dark?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((s, i) => (
        <ScrollReveal key={s.label} delay={i * 60}>
          <div
            className={cn(
              "rounded-2xl border p-4 text-center md:p-5",
              dark ? "border-white/10 bg-white/[0.04]" : "border-black/8 bg-white"
            )}
          >
            <p className={cn("font-serif text-2xl font-bold md:text-3xl", dark ? "text-[var(--gold)]" : "text-primary")}>
              {s.value}
            </p>
            <p className={cn("mt-2 text-xs leading-snug", dark ? "text-white/60" : "text-muted-foreground")}>
              {s.label}
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

export function ActivityGrid({
  items,
  dark = false,
}: {
  items: { title: string; description: string }[];
  dark?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a, i) => (
        <ScrollReveal key={a.title} delay={i * 50}>
          <div
            className={cn(
              "h-full rounded-2xl border p-5 transition-colors hover:border-[var(--gold)]/40",
              dark ? "border-white/10 bg-white/[0.03]" : "border-black/8 bg-white"
            )}
          >
            <h3 className={cn("font-serif text-lg font-semibold", dark ? "text-white" : "text-foreground")}>
              {a.title}
            </h3>
            <p className={cn("mt-2 text-sm leading-relaxed", dark ? "text-white/65" : "text-muted-foreground")}>
              {a.description}
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
