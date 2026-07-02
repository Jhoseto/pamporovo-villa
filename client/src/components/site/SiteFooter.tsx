import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import { useLocation } from "wouter";
import { CONTACT, NAV_LINKS, SITE, SOCIAL } from "@/data/siteContent";
import { useOffersModal } from "@/contexts/OffersModalContext";
import { navigateSiteLink } from "@/lib/siteNav";

const SOCIAL_LINKS = [
  { href: SOCIAL.facebook, label: "Facebook", icon: Facebook },
  { href: SOCIAL.instagram, label: "Instagram", icon: Instagram },
  { href: SOCIAL.youtube, label: "YouTube", icon: Youtube },
] as const;

const FOOTER_NAV = [
  ...NAV_LINKS.filter(link => link.href !== "#offers-modal"),
  { href: "#booking", label: "Резервация" },
  { href: "#policy", label: "Политика" },
] as const;

export function SiteFooter() {
  const { openOffers } = useOffersModal();
  const [location, setLocation] = useLocation();

  const handleNavClick = (href: string, page?: boolean) => {
    navigateSiteLink({ href, label: "", page }, setLocation, location);
  };

  return (
    <footer className="relative overflow-hidden bg-[var(--ink)] py-16 text-white md:py-20">
      <div className="ambient-grid absolute inset-0 opacity-20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />

      <div className="container relative mx-auto px-4">
        <div className="mb-12 flex justify-center md:mb-14">
          <img src={SITE.logo} alt={SITE.name} className="h-12 w-auto md:h-14" />
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-10 lg:gap-16">
          <div>
            <h3 className="premium-form-heading mb-6 text-[var(--gold)]">Контакт</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${CONTACT.phone}`}
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
                <span className="font-display text-base leading-relaxed tracking-wide">
                  {CONTACT.address}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="premium-form-heading mb-6 text-[var(--gold)]">Навигация</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {FOOTER_NAV.map(link => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.href, "page" in link ? link.page : undefined)}
                    className="nav-link text-left text-sm text-white/65 transition hover:text-[var(--gold)]"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openOffers}
                  className="nav-link text-left text-sm text-white/65 transition hover:text-[var(--gold)]"
                >
                  Оферти
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="premium-form-heading mb-6 text-[var(--gold)]">Социални мрежи</h3>
            <p className="mb-6 font-display text-base leading-relaxed tracking-wide text-white/65">
              Елате с нас в планината и онлайн — снимки, сезонни оферти и моменти от Pamporovo Villa.
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-white/50 sm:text-left">
            &copy; {new Date().getFullYear()} {SITE.name}. Всички права запазени.
          </p>
          <p className="text-right text-sm text-white/50">
            developed by{" "}
            <a
              href="https://www.facebook.com/kostadin.serezliev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition hover:text-[var(--gold)]"
            >
              Serezliev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
