import { Facebook, Instagram, Mail, MapPin, Phone, Star, Youtube } from "lucide-react";
import { useLocation } from "wouter";
import { GBP } from "@shared/gbpLinks";
import { CONTACT, NAV_LINKS, SITE, SOCIAL } from "@/data/siteContent";
import { useOffersModal } from "@/contexts/OffersModalContext";
import { CookieSettingsTrigger } from "@/components/site/CookieConsent";
import { usePageSearch } from "@/hooks/usePageLang";
import { useTranslation } from "@/contexts/LocaleContext";
import { useContactAddress } from "@/i18n/contentHooks";
import { trackGoogleReviewClick, trackPhoneClick } from "@/lib/analytics/events";
import { navigateSiteLink } from "@/lib/siteNav";
import { preserveLangOnPath } from "@/lib/localizedNav";

const SOCIAL_LINKS = [
  { href: SOCIAL.facebook, label: "Facebook", icon: Facebook },
  { href: SOCIAL.instagram, label: "Instagram", icon: Instagram },
  { href: SOCIAL.youtube, label: "YouTube", icon: Youtube },
] as const;

const FOOTER_EXTRA = [
  { href: "#booking", label: "Резервация" },
  { href: "#policy", label: "Политика" },
] as const;

const FOOTER_NAV = [
  ...NAV_LINKS.filter(link => link.href !== "#offers-modal"),
  ...FOOTER_EXTRA.filter(extra => !NAV_LINKS.some(link => link.href === extra.href)),
] as const;

export function SiteFooter() {
  const { openOffers } = useOffersModal();
  const [location, setLocation] = useLocation();
  const search = usePageSearch();
  const { t } = useTranslation();
  const address = useContactAddress();

  const footerNavLabel = (href: string, fallback: string) => {
    const keyMap: Record<string, string> = {
      "#booking": "booking",
      "#policy": "policy",
      "#about": "about",
      "#experience": "experience",
      "#gallery": "gallery",
      "#amenities": "amenities",
      "#location": "location",
      "#pricing": "pricing",
      "#contact": "contact",
      "#reviews": "reviews",
      "/pamporovo": "pamporovo",
    };
    const key = keyMap[href];
    return key ? t(`nav.${key}`, fallback) : fallback;
  };

  const handleNavClick = (href: string, page?: boolean) => {
    navigateSiteLink({ href, label: "", page }, setLocation, location, search);
  };

  return (
    <footer className="perf-defer-section relative overflow-hidden bg-[var(--ink)] py-16 text-white md:py-20">
      <div className="ambient-grid absolute inset-0 opacity-20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />

      <div className="container relative mx-auto px-4">
        <div className="mb-12 flex justify-center md:mb-14">
          <img src={SITE.logo} alt={SITE.name} className="h-12 w-auto md:h-14" />
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-10 lg:gap-16">
          <div>
            <h3 className="premium-form-heading mb-6 text-[var(--gold)]">{t("footer.contactHeading", "Контакт")}</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${CONTACT.phone}`}
                  onClick={() => trackPhoneClick("footer")}
                  className="group flex items-start gap-3 text-white/75 transition hover:text-white"
                >
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                  <span className="font-display text-lg tracking-wide">{CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group flex items-start gap-3 text-white/75 transition hover:text-white"
                >
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                  <span className="font-display text-lg tracking-wide">{CONTACT.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <a
                  href={GBP.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-base leading-relaxed tracking-wide transition hover:text-white"
                >
                  {address}
                </a>
              </li>
              <li>
                <a
                  href={GBP.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGoogleReviewClick("footer")}
                  className="group flex items-start gap-3 text-white/75 transition hover:text-white"
                >
                  <Star className="mt-0.5 h-5 w-5 shrink-0 fill-[var(--gold)] text-[var(--gold)]" />
                  <span className="font-display text-base tracking-wide">{t("gbp.reviewLink", "Оставете отзив в Google")}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="premium-form-heading mb-6 text-[var(--gold)]">{t("footer.navHeading", "Навигация")}</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {FOOTER_NAV.map(link => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.href, "page" in link ? link.page : undefined)}
                    className="nav-link text-left text-sm text-white/65 transition hover:text-[var(--gold)]"
                  >
                    {footerNavLabel(link.href, link.label)}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openOffers}
                  className="nav-link text-left text-sm text-white/65 transition hover:text-[var(--gold)]"
                >
                  {t("nav.offers", "Оферти")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="premium-form-heading mb-6 text-[var(--gold)]">{t("footer.socialHeading", "Социални мрежи")}</h3>
            <p className="mb-6 font-display text-base leading-relaxed tracking-wide text-white/65">
              {t("footer.socialBody", "Елате с нас в планината и онлайн — снимки, сезонни оферти и моменти от Pamporovo Villa.")}
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/75 transition hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="premium-form-divider my-10 opacity-40" />

        <div className="grid grid-cols-3 items-center gap-4">
          <p className="text-sm text-white/45">
            &copy; {new Date().getFullYear()} {SITE.name}. {t("footer.copyright", "Всички права запазени.")}
          </p>
          <div className="flex items-center justify-center gap-x-4">
            <button
              type="button"
              onClick={() =>
                window.location.assign(preserveLangOnPath("/legal?tab=privacy", search))
              }
              className="text-xs text-white/35 transition hover:text-[var(--gold)]"
            >
              {t("nav.privacy", "Поверителност")}
            </button>
            <span className="text-white/20 text-xs">·</span>
            <button
              type="button"
              onClick={() =>
                window.location.assign(preserveLangOnPath("/legal?tab=terms", search))
              }
              className="text-xs text-white/35 transition hover:text-[var(--gold)]"
            >
              {t("nav.terms", "Общи условия")}
            </button>
            <span className="text-white/20 text-xs">·</span>
            <button
              type="button"
              onClick={() =>
                window.location.assign(preserveLangOnPath("/legal?tab=cookies", search))
              }
              className="text-xs text-white/35 transition hover:text-[var(--gold)]"
            >
              {t("nav.cookies", "Бисквитки")}
            </button>
            <span className="text-white/20 text-xs">·</span>
            <CookieSettingsTrigger />
          </div>
          <p className="text-right text-xs text-white/30">
            developed by{" "}
            <a
              href="https://www.facebook.com/kostadin.serezliev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition hover:text-[var(--gold)]"
            >
              Serezliev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
