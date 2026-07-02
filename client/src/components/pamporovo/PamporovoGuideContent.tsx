import {
  CAVES,
  ECO_TRAILS,
  HERO_IMAGES,
  LANDMARKS,
  PISTES,
  RESORT_STATS,
  SKI_EXTRAS,
  SKI_LIFTS,
  SUMMER_ACTIVITIES,
  WINTER_ACTIVITIES,
} from "@/data/pamporovoContent";
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
import { navigateToHomeSection } from "@/lib/siteNav";
import { useLocation } from "wouter";

export function PamporovoGuideContent() {
  const [location, setLocation] = useLocation();

  return (
    <>
      <SectionShell
        id="pamporovo-intro"
        eyebrow="Курортът"
        title="Сърцето на Родопите"
        subtitle="На 1650 м надморска височина, в подножието на връх Снежанка — най-старият български ски курорт, основан през 1933 г."
        overlap
      >
        <StatGrid stats={RESORT_STATS} />
        <ScrollReveal className="mt-10" delay={80}>
          <TiltImage
            src={HERO_IMAGES.panorama}
            alt="Зимен курорт Пампорово — хотели и писти в Родопите"
            className="aspect-[21/9] rounded-2xl"
            maxTilt={4}
          />
        </ScrollReveal>
        <ScrollReveal className="mt-12" delay={120}>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <TiltImage
              src={HERO_IMAGES.tower}
              alt="Кулата Снежанка — символ на Пампорово"
              className="aspect-[4/3] rounded-2xl"
              maxTilt={8}
            />
            <div className="space-y-4 font-display text-base leading-relaxed tracking-wide text-muted-foreground">
              <p>
                Два основни ски центъра — <strong className="text-foreground">Студенец</strong> и{" "}
                <strong className="text-foreground">Малина</strong> — свързани с връх Снежанка (1926 м).
                Пистите са между 1400 и 1926 м, с модерни лифтове и над 80 снежни оръдия.
              </p>
              <p>
                Лятото курортът се превръща в база за еко туризъм — маркирани пътеки, колоездене,
                конна езда и безброй забележителности на 15–60 минути с кола до Смолян, Широка лъка,
                Чудните мостове и подземните дворци на Западните Родопи.
              </p>
              <MagneticButton
                className="premium-btn mt-4"
                onClick={() => navigateToHomeSection("booking", setLocation, location)}
              >
                Резервирай вила в Пампорово
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </SectionShell>

      <SectionShell
        id="pamporovo-winter"
        eyebrow="Зима"
        title="Ски зона — писти и лифтове"
        subtitle="37+ км маркирани писти за ски и сноуборд, нощно каране на Стената и маршрути за ски бягане"
        dark
        darkOverlap
      >
        <ScrollReveal>
          <TiltImage
            src={HERO_IMAGES.ski}
            alt="Седалков лифт към връх Снежанка — кулата над Пампорово"
            className="mb-12 aspect-[21/9] rounded-2xl"
            maxTilt={4}
          />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h3 className="mb-4 font-serif text-2xl font-semibold text-white">Писти по трудност</h3>
          <PisteTable pistes={PISTES} dark />
        </ScrollReveal>

        <ScrollReveal className="mt-12" delay={100}>
          <h3 className="mb-4 font-serif text-2xl font-semibold text-white">Лифтове и съоръжения</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
            <table className="w-full min-w-[560px] text-left text-sm text-white/85">
              <thead>
                <tr className="border-b border-white/10 text-white/55">
                  <th className="px-4 py-3">Маршрут</th>
                  <th className="px-4 py-3">Тип</th>
                  <th className="px-4 py-3">Дължина</th>
                  <th className="px-4 py-3">Капацитет/ч</th>
                </tr>
              </thead>
              <tbody>
                {SKI_LIFTS.map(l => (
                  <tr key={l.route} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{l.route}</td>
                    <td className="px-4 py-3">{l.type}</td>
                    <td className="px-4 py-3">{l.lengthM} м</td>
                    <td className="px-4 py-3">{l.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-10" delay={120}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SKI_EXTRAS.map(extra => (
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
          <h3 className="mb-6 font-serif text-2xl font-semibold text-white">Зимни активности</h3>
          <ActivityGrid items={WINTER_ACTIVITIES} dark />
        </ScrollReveal>
      </SectionShell>

      <SectionShell
        id="pamporovo-summer"
        eyebrow="Лято"
        title="Еко пътеки и природа"
        subtitle="Каньонът на водопадите, Смолянските езера, Орфеевите скали — на минути от курорта"
        overlap
      >
        <ScrollReveal>
          <TiltImage
            src={HERO_IMAGES.summer}
            alt="Планинско езеро в Родопите — лятна еко пътека край Пампорово"
            className="mb-12 aspect-[21/9] rounded-2xl"
            maxTilt={4}
          />
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {ECO_TRAILS.map(item => (
            <AttractionCard key={item.id} item={item} />
          ))}
        </div>

        <ScrollReveal className="mt-12" delay={100}>
          <h3 className="mb-6 font-serif text-2xl font-semibold">Летни активности</h3>
          <ActivityGrid items={SUMMER_ACTIVITIES} />
        </ScrollReveal>
      </SectionShell>

      <SectionShell
        id="pamporovo-landmarks"
        eyebrow="Околността"
        title="Забележителности и села"
        subtitle="Архитектурни резервати, обсерватория, планетариум и автентичен родопски фолклор"
        dark
        darkOverlap
      >
        <div className="grid gap-8 md:grid-cols-2">
          {LANDMARKS.map(item => (
            <AttractionCard key={item.id} item={item} dark />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="pamporovo-caves"
        eyebrow="Подземен свят"
        title="Пещери и ждрела"
        subtitle="Ягодинска пещера, Дяволското гърло, Триградско ждрело и Ухловица — съкровища на Западните Родопи"
        overlap
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {CAVES.map(item => (
            <AttractionCard key={item.id} item={item} large={item.id === "devils-throat"} />
          ))}
        </div>

        <ScrollReveal className="mt-16 text-center" delay={120}>
          <p className="mx-auto max-w-xl font-display text-lg tracking-wide text-muted-foreground">
            Вилите Pamporovo Villa са на Райковски ливади — идеална база за зимни и летни приключения в
            целия регион.
          </p>
          <MagneticButton
            className="premium-btn mt-8"
            onClick={() => navigateToHomeSection("booking", setLocation, location)}
          >
            Виж свободни дати и резервирай
          </MagneticButton>
        </ScrollReveal>
      </SectionShell>
    </>
  );
}
