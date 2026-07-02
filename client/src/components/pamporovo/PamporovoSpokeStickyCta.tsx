import { MagneticButton } from "@/components/site/MagneticButton";
import { navigateToHomeSection } from "@/lib/siteNav";
import { useLocation } from "wouter";

export function PamporovoSpokeStickyCta() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[var(--cream)]/95 px-4 py-3 backdrop-blur-md md:hidden">
      <div className="container mx-auto flex gap-2">
        <MagneticButton
          className="premium-btn h-11 flex-1 text-sm"
          onClick={() => navigateToHomeSection("booking", setLocation, location)}
        >
          Резервирай
        </MagneticButton>
        <MagneticButton
          variant="outline"
          className="h-11 flex-1 text-sm"
          onClick={() => setLocation("/rent")}
        >
          Наем · цени
        </MagneticButton>
      </div>
    </div>
  );
}
