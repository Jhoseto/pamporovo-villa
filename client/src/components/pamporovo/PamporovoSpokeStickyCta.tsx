import { MagneticButton } from "@/components/site/MagneticButton";
import { useGuideUi } from "@/i18n/guideHooks";
import { useLocalizedNav } from "@/hooks/useLocalizedNav";
import { navigateToHomeSection } from "@/lib/siteNav";
import { useLocation } from "wouter";

export function PamporovoSpokeStickyCta() {
  const [location, setLocation] = useLocation();
  const { navigate, search } = useLocalizedNav();
  const { stickyBook, stickyRent } = useGuideUi();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[var(--cream)]/95 px-4 py-3 backdrop-blur-md md:hidden">
      <div className="container mx-auto flex gap-2">
        <MagneticButton
          className="premium-btn h-11 flex-1 text-sm"
          onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
        >
          {stickyBook}
        </MagneticButton>
        <MagneticButton
          variant="outline"
          className="h-11 flex-1 text-sm"
          onClick={() => navigate("/rent")}
        >
          {stickyRent}
        </MagneticButton>
      </div>
    </div>
  );
}
