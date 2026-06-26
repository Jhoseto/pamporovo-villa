import { cn } from "@/lib/utils";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  mapTitle?: string;
  variant?: "default" | "premium";
}

export function MapView({
  className,
  initialCenter = { lat: 41.654, lng: 24.682 },
  initialZoom = 14,
  mapTitle,
  variant = "default",
}: MapViewProps) {
  const isPremium = variant === "premium";
  const src = `https://www.google.com/maps?q=${initialCenter.lat},${initialCenter.lng}&z=${initialZoom}&hl=bg&output=embed`;

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
