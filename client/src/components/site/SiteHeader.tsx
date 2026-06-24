import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_LINKS, SITE } from "@/data/siteContent";
import { useOffersModal } from "@/contexts/OffersModalContext";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "./MagneticButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const scrolled = useHeaderScroll(80);
  const [open, setOpen] = useState(false);
  const { openOffers } = useOffersModal();
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const handleNavClick = (href: string) => {
    if (href === "#offers-modal") {
      openOffers();
      setOpen(false);
      return;
    }
    scrollToSection(href);
    setOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-[var(--ink)]/80 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent"
        style={{ width: progressWidth }}
      />

      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="shrink-0 transition-opacity hover:opacity-90"
          aria-label={SITE.name}
        >
          <img
            src={SITE.logo}
            alt={SITE.name}
            className="h-10 w-auto md:h-12"
            width={240}
            height={48}
          />
        </button>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Основна навигация">
          {NAV_LINKS.map(link => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className={cn(
                "text-sm font-medium tracking-wide transition hover:text-[var(--gold)]",
                scrolled ? "text-white/70" : "text-white/80"
              )}
            >
              {link.label}
            </button>
          ))}
          <MagneticButton
            size="sm"
            className="premium-btn"
            onClick={() => handleNavClick("#booking")}
          >
            Резервирай
          </MagneticButton>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              variant="outline"
              size="icon"
              aria-label="Отвори меню"
              className={cn(
                "border-white/20 bg-white/5 backdrop-blur-sm",
                scrolled ? "text-white" : "text-white"
              )}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] border-white/10 bg-[var(--ink)] text-white">
            <SheetHeader>
              <SheetTitle className="sr-only">{SITE.name}</SheetTitle>
              <img src={SITE.logo} alt={SITE.name} className="h-10 w-auto" />
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4" aria-label="Мобилна навигация">
              {NAV_LINKS.map(link => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="text-left text-lg font-medium text-white/70 transition hover:text-[var(--gold)]"
                >
                  {link.label}
                </button>
              ))}
              <MagneticButton className="premium-btn mt-4" onClick={() => handleNavClick("#booking")}>
                Резервирай
              </MagneticButton>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
