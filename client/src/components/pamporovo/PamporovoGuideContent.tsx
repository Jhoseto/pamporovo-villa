import { HERO_IMAGES } from "@/data/pamporovoContent";
import { SectionShell } from "@/components/site/SectionShell";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { TiltImage } from "@/components/site/TiltImage";
import {
  ActivityGrid,
  AttractionCard,
  PisteTable,
  StatGrid,
} from "@/components/pamporovo/PamporovoCards";
import { useLocalizedNav } from "@/hooks/useLocalizedNav";
import { navigateToHomeSection } from "@/lib/siteNav";
import {
  useGuideCaves,
  useGuideEcoTrails,
  useGuideLandmarks,
  useGuidePistes,
  useGuideSection,
  useGuideSkiExtras,
  useGuideSkiLifts,
  useGuideStats,
  useGuideSummerActivities,
  useGuideUi,
  useGuideWinterActivities,
} from "@/i18n/guideHooks";
import { useLocation } from "wouter";

export function PamporovoGuideContent() {
  const [location, setLocation] = useLocation();
  const { search } = useLocalizedNav();
  const intro = useGuideSection("intro");
  const winter = useGuideSection("winter");
  const summer = useGuideSection("summer");
  const landmarks = useGuideSection("landmarks");
  const caves = useGuideSection("caves");
  const ui = useGuideUi();
  const stats = useGuideStats();
  const pistes = useGuidePistes();
  const skiLifts = useGuideSkiLifts();
  const skiExtras = useGuideSkiExtras();
  const winterActivities = useGuideWinterActivities();
  const summerActivities = useGuideSummerActivities();
  const ecoTrails = useGuideEcoTrails();
  const landmarkItems = useGuideLandmarks();
  const caveItems = useGuideCaves();

  return (
    <>
      <SectionShell
        id="pamporovo-intro"
        eyebrow={intro.eyebrow}
        title={intro.title}
        subtitle={intro.subtitle}
        overlap
      >
        <StatGrid stats={stats} />
        <ScrollReveal className="mt-10" delay={80}>
          <TiltImage
            src={HERO_IMAGES.panorama}
            alt={intro.panoramaAlt ?? ""}
            className="aspect-[21/9] rounded-2xl"
            maxTilt={4}
          />
        </ScrollReveal>
        <ScrollReveal className="mt-12" delay={120}>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <TiltImage
              src={HERO_IMAGES.tower}
              alt={intro.towerAlt ?? ""}
              className="aspect-[4/3] rounded-2xl"
              maxTilt={8}
            />
            <div className="space-y-4 font-display text-base leading-relaxed tracking-wide text-muted-foreground">
              <p>{intro.p1}</p>
              <p>{intro.p2}</p>
              <MagneticButton
                className="premium-btn mt-4"
                onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
              >
                {intro.cta}
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </SectionShell>

      <SectionShell
        id="pamporovo-winter"
        eyebrow={winter.eyebrow}
        title={winter.title}
        subtitle={winter.subtitle}
        dark
        darkOverlap
      >
        <ScrollReveal>
          <TiltImage
            src={HERO_IMAGES.ski}
            alt={winter.skiAlt ?? ""}
            className="mb-12 aspect-[21/9] rounded-2xl"
            maxTilt={4}
          />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h3 className="mb-4 font-serif text-2xl font-semibold text-white">{winter.pistesHeading}</h3>
          <PisteTable pistes={pistes} dark />
        </ScrollReveal>

        <ScrollReveal className="mt-12" delay={100}>
          <h3 className="mb-4 font-serif text-2xl font-semibold text-white">{winter.liftsHeading}</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
            <table className="w-full min-w-[560px] text-left text-sm text-white/85">
              <thead>
                <tr className="border-b border-white/10 text-white/55">
                  <th className="px-4 py-3">{ui.route}</th>
                  <th className="px-4 py-3">{ui.liftType}</th>
                  <th className="px-4 py-3">{ui.length}</th>
                  <th className="px-4 py-3">{ui.capacity}</th>
                </tr>
              </thead>
              <tbody>
                {skiLifts.map(l => (
                  <tr key={l.route} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{l.route}</td>
                    <td className="px-4 py-3">{l.type}</td>
                    <td className="px-4 py-3">
                      {l.lengthM} {ui.meters}
                    </td>
                    <td className="px-4 py-3">{l.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-10" delay={120}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {skiExtras.map(extra => (
              <li
                key={extra}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75"
              >
                {extra}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal className="mt-12" delay={140}>
          <h3 className="mb-6 font-serif text-2xl font-semibold text-white">{winter.activitiesHeading}</h3>
          <ActivityGrid items={winterActivities} dark />
        </ScrollReveal>
      </SectionShell>

      <SectionShell
        id="pamporovo-summer"
        eyebrow={summer.eyebrow}
        title={summer.title}
        subtitle={summer.subtitle}
        overlap
      >
        <ScrollReveal>
          <TiltImage
            src={HERO_IMAGES.summer}
            alt={summer.summerAlt ?? ""}
            className="mb-12 aspect-[21/9] rounded-2xl"
            maxTilt={4}
          />
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {ecoTrails.map(item => (
            <AttractionCard key={item.id} item={item} />
          ))}
        </div>

        <ScrollReveal className="mt-12" delay={100}>
          <h3 className="mb-6 font-serif text-2xl font-semibold">{summer.activitiesHeading}</h3>
          <ActivityGrid items={summerActivities} />
        </ScrollReveal>
      </SectionShell>

      <SectionShell
        id="pamporovo-landmarks"
        eyebrow={landmarks.eyebrow}
        title={landmarks.title}
        subtitle={landmarks.subtitle}
        dark
        darkOverlap
      >
        <div className="grid gap-8 md:grid-cols-2">
          {landmarkItems.map(item => (
            <AttractionCard key={item.id} item={item} dark />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="pamporovo-caves"
        eyebrow={caves.eyebrow}
        title={caves.title}
        subtitle={caves.subtitle}
        overlap
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {caveItems.map(item => (
            <AttractionCard key={item.id} item={item} large={item.id === "devils-throat"} />
          ))}
        </div>

        <ScrollReveal className="mt-16 text-center" delay={120}>
          <p className="mx-auto max-w-xl font-display text-lg tracking-wide text-muted-foreground">
            {caves.footer}
          </p>
          <MagneticButton
            className="premium-btn mt-8"
            onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
          >
            {caves.cta}
          </MagneticButton>
        </ScrollReveal>
      </SectionShell>
    </>
  );
}
