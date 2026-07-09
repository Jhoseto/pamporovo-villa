import { Mail, MapPin, Phone, Star } from "lucide-react";
import { GBP } from "@shared/gbpLinks";
import { CONTACT } from "@/data/siteContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { useContactAddress } from "@/i18n/contentHooks";
import { trackContactClick, trackGoogleReviewClick } from "@/lib/analytics/events";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

const contactCardClass =
  "contact-card premium-form-card flex min-w-0 flex-col items-center gap-3.5 p-5 text-center transition hover:shadow-[0_32px_80px_-28px_rgba(0,0,0,0.18)] sm:items-start sm:px-6 sm:py-6 sm:text-left";

export function ContactSection() {
  const { t } = useTranslation();
  const address = useContactAddress();

  return (
    <SectionShell
      eyebrow={t("home.contact.eyebrow", "Контакт")}
      title={t("home.contact.title", "Да поговорим за вашата почивка")}
      subtitle={t("home.contact.subtitle", "Имате въпрос или специално желание? Звъннете или ни пишете — отговаряме лично и с удоволствие")}
      overlap
      splitTitle
      perfDefer
    >
      <ScrollReveal>
        <div className="contact-cards-grid">
          <a
            href={`tel:${CONTACT.phone}`}
            onClick={() => trackContactClick("phone")}
            className={contactCardClass}
          >
            <Phone className="h-5 w-5 shrink-0 text-[var(--gold)]" />
            <div className="contact-card-body min-w-0 w-full">
              <p className="premium-label mb-1.5">{t("common.phone", "Телефон")}</p>
              <p className="contact-card-value">{CONTACT.phoneDisplay}</p>
            </div>
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            onClick={() => trackContactClick("email")}
            className={contactCardClass}
          >
            <Mail className="h-5 w-5 shrink-0 text-[var(--gold)]" />
            <div className="contact-card-body min-w-0 w-full">
              <p className="premium-label mb-1.5">{t("common.email", "Имейл")}</p>
              <p className="contact-card-value">{CONTACT.email}</p>
            </div>
          </a>
          <a
            href={GBP.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContactClick("google_maps")}
            className={contactCardClass}
          >
            <MapPin className="h-5 w-5 shrink-0 text-[var(--gold)]" />
            <div className="contact-card-body min-w-0 w-full">
              <p className="premium-label mb-1.5">{t("gbp.maps", "Google Maps")}</p>
              <p className="contact-card-value">{address}</p>
            </div>
          </a>
          <a
            href={GBP.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGoogleReviewClick("contact_section")}
            className={contactCardClass}
          >
            <Star className="h-5 w-5 shrink-0 fill-[var(--gold)] text-[var(--gold)]" />
            <div className="contact-card-body min-w-0 w-full">
              <p className="premium-label mb-1.5">{t("gbp.reviewShort", "Google отзив")}</p>
              <p className="contact-card-value">{t("gbp.reviewLink", "Оставете отзив в Google")}</p>
            </div>
          </a>
        </div>
      </ScrollReveal>
    </SectionShell>
  );
}
