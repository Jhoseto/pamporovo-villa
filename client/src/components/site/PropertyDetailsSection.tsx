import { HeartHandshake, Home, Trees } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function PropertyDetailsSection() {
  const { t } = useTranslation();

  const storyBlocks = [
    {
      label: t("home.about.blockPlace", "Мястото"),
      text: t("home.about.intro", "Радваме се, че ни откривате. Предлагаме ви три самостоятелни вили, сгушени в боровата гора на Райковски ливади — там, където градският шум остава далеч, а денят започва с песен на птици и аромат на смола."),
      icon: Trees,
    },
    {
      label: t("home.about.blockHome", "У дома"),
      text: t("home.about.details", "Вила 1, Вила 2 и Вила Deluxe са обзаведени така, както бихме искали да изглежда собственият ни дом в планината — с истинско дърво, мек текстил и онези малки детайли, които карат едно място да се усеща топло. Тук не сте просто гости; чувствайте се у дома."),
      icon: Home,
    },
    {
      label: t("home.about.blockHosts", "Домакините"),
      text: t("home.about.hosts", "Като домакини сме на една ръка разстояние. Помагаме за изненади и тържества, насочваме ви към най-хубавите писти и пътеки, подсказваме къде се яде вкусно — а ако нещо ви трябва, просто звъннете. Нашата цел е една: да си тръгнете с желание да се върнете."),
      icon: HeartHandshake,
    },
  ] as const;

  return (
    <SectionShell
      id="about"
      eyebrow={t("home.about.eyebrow", "За нас")}
      title={t("home.about.title", "Вашият дом високо в Родопите")}
      subtitle={t("home.about.subtitle", "Три вили, една грижа — да се чувствате като у дома")}
      overlap
      splitTitle
    >
      <div className="about-premium mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="about-premium-gallery">
              <div className="about-premium-gallery__frame" aria-hidden />
              <div className="about-premium-gallery__main overflow-hidden rounded-[1.25rem] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.35)]">
                <img
                  src="/photos/11.jpg"
                  alt={t("home.about.imageForestAlt", "Вила в боровата гора на Райковски ливади")}
                  className="aspect-[4/5] h-full w-full object-cover object-center transition duration-700 hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-premium-gallery__accent overflow-hidden rounded-xl border border-[var(--gold)]/35 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]">
                <img
                  src="/photos/01.jpg"
                  alt={t("home.about.imageInteriorAlt", "Интериор с каменна стена и дърво")}
                  className="aspect-[4/3] h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-premium-gallery__badge">
                <span className="eyebrow text-[var(--gold)]">{t("home.about.badgeLocation", "Райковски ливади")}</span>
                <span className="mt-1 block font-serif text-lg font-semibold text-foreground">
                  {t("home.about.badgeResort", "Пампорово")}
                </span>
              </div>
            </div>
          </ScrollReveal>

          <div className="lg:col-span-7">
            <div className="about-premium-stories">
              {storyBlocks.map((block, index) => {
                const Icon = block.icon;
                return (
                  <ScrollReveal key={block.label} delay={index * 90}>
                    <article
                      className="about-premium-story group"
                      data-first={index === 0 ? "" : undefined}
                    >
                      <div className="about-premium-story__marker" aria-hidden>
                        <span className="about-premium-story__index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="about-premium-story__line" />
                      </div>

                      <div className="about-premium-story__body">
                        <div className="mb-4 flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/8 text-[var(--gold)] transition duration-500 group-hover:border-[var(--gold)]/45 group-hover:bg-[var(--gold)]/14">
                            <Icon className="h-4 w-4" strokeWidth={1.5} />
                          </span>
                          <p className="eyebrow text-muted-foreground">{block.label}</p>
                        </div>
                        <p className="about-premium-story__text">{block.text}</p>
                      </div>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
