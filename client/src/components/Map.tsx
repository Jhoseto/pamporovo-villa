import { cn } from "@/lib/utils";
import { useConsentOptional } from "@/contexts/ConsentContext";
import { MapPin } from "lucide-react";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  mapTitle?: string;
  variant?: "default" | "premium";
}

function MapPlaceholder({
  className,
  variant,
  onEnable,
}: {
  className?: string;
  variant: "default" | "premium";
  onEnable: () => void;
}) {
  const isPremium = variant === "premium";

  return (
    <div
      className={cn(
        "location-map-embed relative flex flex-col items-center justify-center overflow-hidden bg-[var(--cream)]",
        isPremium && "location-map-canvas",
        isPremium ? "h-[420px] md:h-[520px]" : "h-[500px]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.94_0.02_85)_0%,oklch(0.88_0.03_75)_100%)]" />
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10">
          <MapPin className="h-5 w-5 text-[var(--gold)]" />
        </div>
        <div>
          <p className="font-serif text-lg font-semibold text-foreground">Интерактивна карта</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Google Maps използва бисквитки на трети страни. Разрешете функционалните бисквитки, за
            да видите картата.
          </p>
        </div>
        <button type="button" onClick={onEnable} className="premium-btn rounded-full px-6 py-3 text-sm">
          Покажи карта
        </button>
      </div>
    </div>
  );
}

export function MapView({
  className,
  initialCenter = { lat: 41.654, lng: 24.682 },
  initialZoom = 14,
  mapTitle,
  variant = "default",
}: MapViewProps) {
  const consent = useConsentOptional();
  const functionalGranted = consent?.consent?.functional ?? false;
  const isPremium = variant === "premium";
  const src = `https://www.google.com/maps?q=${initialCenter.lat},${initialCenter.lng}&z=${initialZoom}&hl=bg&output=embed`;

  if (!functionalGranted) {
    return (
      <MapPlaceholder
        className={className}
        variant={variant}
        onEnable={() => consent?.enableFunctional()}
      />
    );
  }

  return (
    <div
      className={cn(
        "location-map-embed relative overflow-hidden",
        isPremium && "location-map-canvas",
        isPremium ? "h-[420px] md:h-[520px]" : "h-[500px]",
        className
      )}
    >
      <iframe
        title={mapTitle ?? "Карта"}
        src={src}
        className="location-map-embed-frame h-[calc(100%+3rem)] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {isPremium && (
        <>
          <div className="location-map-vignette pointer-events-none" aria-hidden />
          <div className="location-map-branding-cover pointer-events-none" aria-hidden />
        </>
      )}
    </div>
  );
}
