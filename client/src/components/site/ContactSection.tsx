import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/data/siteContent";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function ContactSection() {
  return (
    <SectionShell
      eyebrow="Контакт"
      title="Да поговорим за вашата почивка"
      subtitle="Имате въпрос или специално желание? Звъннете или ни пишете — отговаряме лично и с удоволствие"
      overlap
      splitTitle
      perfDefer
    >
      <ScrollReveal>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
          <a
            href={`tel:${CONTACT.phone}`}
            className="premium-form-card flex flex-col items-center gap-3 p-5 text-center transition hover:shadow-[0_32px_80px_-28px_rgba(0,0,0,0.18)] sm:items-start sm:text-left md:p-6"
          >
            <Phone className="h-5 w-5 shrink-0 text-[var(--gold)]" />
            <div>
              <p className="premium-label mb-1.5">Телефон</p>
              <p className="font-display text-lg tracking-wide text-foreground">{CONTACT.phoneDisplay}</p>
            </div>
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="premium-form-card flex flex-col items-center gap-3 p-5 text-center transition hover:shadow-[0_32px_80px_-28px_rgba(0,0,0,0.18)] sm:items-start sm:text-left md:p-6"
          >
            <Mail className="h-5 w-5 shrink-0 text-[var(--gold)]" />
            <div>
              <p className="premium-label mb-1.5">Имейл</p>
              <p className="font-display text-lg tracking-wide text-foreground">{CONTACT.email}</p>
            </div>
          </a>
          <div className="premium-form-card flex flex-col items-center gap-3 p-5 text-center sm:items-start sm:text-left md:p-6">
            <MapPin className="h-5 w-5 shrink-0 text-[var(--gold)]" />
            <div>
              <p className="premium-label mb-1.5">Адрес</p>
              <p className="font-display text-lg leading-relaxed tracking-wide text-foreground">
                {CONTACT.address}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </SectionShell>
  );
}
