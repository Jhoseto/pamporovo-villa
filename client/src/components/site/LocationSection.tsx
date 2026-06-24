import { MapPin, Navigation } from "lucide-react";
import { CONTACT, DISTANCES, PAMPOROVO_INFO, PROPERTY_LOCATION } from "@/data/siteContent";
import { MapView } from "@/components/Map";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function LocationSection() {
  return (
    <SectionShell
      id="location"
      eyebrow="Локация"
      title="Къде се намираме"
      subtitle="к.к. Пампорово, местност Райковски ливади — в тиха борова гора"
    >
      <ScrollReveal className="mb-10">
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-foreground/75">
          {PAMPOROVO_INFO}
        </p>
      </ScrollReveal>

      <div className="grid items-stretch gap-8 lg:grid-cols-[1fr_360px]">
        <ScrollReveal direction="left">
          <div className="overflow-hidden rounded-3xl border border-border/60 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)]">
            <MapView
              className="h-[420px] md:h-[500px]"
              initialCenter={{ lat: PROPERTY_LOCATION.lat, lng: PROPERTY_LOCATION.lng }}
              initialZoom={14}
              mapTitle={PROPERTY_LOCATION.label}
              onMapReady={map => {
                if (!window.google?.maps?.marker) return;
                new window.google.maps.marker.AdvancedMarkerElement({
                  map,
                  position: { lat: PROPERTY_LOCATION.lat, lng: PROPERTY_LOCATION.lng },
                  title: PROPERTY_LOCATION.label,
                });
              }}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={120} className="flex flex-col gap-4">
          {DISTANCES.map(item => (
            <div key={item.label} className="floating-card flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow text-muted-foreground">{item.label}</p>
                <p className="font-serif text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="floating-card flex items-start gap-4 p-6">
            <MapPin className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">{PROPERTY_LOCATION.label}</p>
              <p className="text-foreground/70">{CONTACT.address}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
