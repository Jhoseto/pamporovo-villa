import { Facebook, Instagram, Youtube } from "lucide-react";
import { CONTACT, SITE, SOCIAL } from "@/data/siteContent";

const SOCIAL_LINKS = [
  { href: SOCIAL.facebook, label: "Facebook", icon: Facebook },
  { href: SOCIAL.instagram, label: "Instagram", icon: Instagram },
  { href: SOCIAL.youtube, label: "YouTube", icon: Youtube },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[var(--ink)] py-16 text-white">
      <div className="ambient-grid absolute inset-0 opacity-20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />
      <div className="container relative mx-auto px-4 text-center">
        <img src={SITE.logo} alt={SITE.name} className="mx-auto h-12 w-auto" />
        <p className="eyebrow mt-4 text-white/70">{CONTACT.address}</p>
        <div className="mt-6 flex justify-center gap-4">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="rounded-full border border-white/15 bg-white/5 p-3 text-white/70 transition hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p className="mt-10 text-sm text-white/60">
          &copy; {new Date().getFullYear()} {SITE.name}. Всички права запазени.
        </p>
      </div>
    </footer>
  );
}
