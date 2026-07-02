import { ChevronRight, Menu } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { CONTACT, NAV_LINKS, SITE } from "@/data/siteContent";
import { useOffersModal } from "@/contexts/OffersModalContext";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { navigateSiteLink } from "@/lib/siteNav";
import { cn } from "@/lib/utils";
import { MagneticButton } from "./MagneticButton";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function SiteLogo({ variant = "header" }: { variant?: "header" | "menu" }) {
  return (
    <img
      src={SITE.logo}
      alt={SITE.name}
      width={1024}
      height={250}
      className={variant === "menu" ? "site-logo site-logo--menu" : "site-logo"}
      style={{ aspectRatio: "1024 / 250" }}
      decoding="async"
    />
  );
}

export function SiteHeader() {
  const scrolled = useHeaderScroll(80);
  const scrollProgress = useScrollProgress();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { openOffers } = useOffersModal();

  const handleNavClick = (href: string, page?: boolean) => {
    navigateSiteLink({ href, label: "", page }, setLocation, location);
    setOpen(false);
  };

  const isActiveLink = (href: string, page?: boolean) => {
    if (page || href.startsWith("/")) return location === href;
    return location === "/" && false;
  };

  return (
    <header
      className={cn(
        "site-header fixed top-0 z-50 w-full transition-all duration-500",
        scrolled && "is-scrolled",
        scrolled
          ? "border-b border-white/10 bg-[var(--ink)]/80 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        className="site-header-progress absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden
      />

      <div className="site-header-inner">
        <button
          type="button"
          onClick={() => {
            setLocation("/");
            window.scrollTo(0, 0);
          }}
          className="site-logo-btn site-header-logo min-w-0"
          aria-label={SITE.name}
        >
          <SiteLogo />
        </button>

        <nav
          className="site-header-nav hidden items-center gap-4 xl:gap-5 lg:flex"
          aria-label="Основна навигация"
        >
          {NAV_LINKS.map(link => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavClick(link.href, link.page)}
              className={cn(
                "nav-link lg:text-[0.8125rem] xl:text-[0.9375rem] hover:text-[var(--gold)]",
                scrolled ? "text-white/75" : "text-white/90",
                isActiveLink(link.href, link.page) && "text-[var(--gold)]"
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="site-header-end">
          <MagneticButton
            size="sm"
            className="premium-btn nav-cta hidden px-5 lg:inline-flex"
            onClick={() => openOffers()}
          >
            Топ оферти
          </MagneticButton>

          <div className="site-header-menu lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Отвори меню"
                  className="mobile-menu-trigger"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                overlayClassName="mobile-nav-overlay bg-black/70"
                className="mobile-nav-sheet w-[min(100vw,20rem)] gap-0 border-l border-[var(--gold)]/25 bg-[var(--ink)] p-0 text-white sm:max-w-[20rem]"
              >
                <SheetTitle className="sr-only">{SITE.name}</SheetTitle>

                <div className="mobile-nav-bg pointer-events-none absolute inset-0" aria-hidden />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/70 to-transparent"
                  aria-hidden
                />

                <div className="relative flex h-full flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[max(3.5rem,env(safe-area-inset-top,0px))]">
                  <SiteLogo variant="menu" />

                  <p className="eyebrow mt-3 text-[var(--gold)]/80">{SITE.tagline}</p>

                  <nav className="mt-8 flex flex-1 flex-col" aria-label="Мобилна навигация">
                    {NAV_LINKS.map((link, index) => (
                      <button
                        key={link.href}
                        type="button"
                        onClick={() => handleNavClick(link.href, link.page)}
                        className="mobile-nav-link group"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="mobile-nav-link-icon h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </button>
                    ))}
                  </nav>

                  <div className="mobile-nav-footer mt-6 space-y-3 border-t border-white/10 pt-6">
                    <MagneticButton
                      className="premium-btn nav-cta h-12 w-full"
                      onClick={() => {
                        openOffers();
                        setOpen(false);
                      }}
                    >
                      Топ оферти
                    </MagneticButton>
                    <MagneticButton
                      className="premium-btn nav-cta h-12 w-full"
                      onClick={() => handleNavClick("#booking")}
                    >
                      Резервирай
                    </MagneticButton>
                    <a
                      href={`tel:${CONTACT.phone}`}
                      className="mt-1 block text-center font-display text-sm tracking-wide text-white/55 transition hover:text-[var(--gold)]"
                    >
                      {CONTACT.phoneDisplay}
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
