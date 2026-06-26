import type { ReactNode } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  MapPin,
  Navigation,
  Phone,
  Sun,
  Wind,
} from "lucide-react";
import { CONTACT, PROPERTY_LOCATION } from "@/data/siteContent";
import { usePamporovoWeather } from "@/hooks/usePamporovoWeather";
import { formatWindSpeed, type WeatherIconKind } from "@/lib/weather";
import { cn } from "@/lib/utils";

const WEATHER_ICONS: Record<WeatherIconKind, typeof Sun> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudRain,
  rain: CloudRain,
  snow: CloudSnow,
  showers: CloudRain,
  thunderstorm: CloudLightning,
};

type HeroGlassPanelProps = {
  className?: string;
  children: ReactNode;
};

export function HeroGlassPanel({ className, children }: HeroGlassPanelProps) {
  return <div className={cn("glass-panel hero-glass-panel w-full", className)}>{children}</div>;
}

export function HeroWeatherWidget() {
  const weather = usePamporovoWeather();

  if (weather.status === "loading") {
    return (
      <div className="hero-glass-widget hero-weather-widget p-4" aria-busy="true" aria-label="Зареждане на времето">
        <div className="hero-weather-skeleton mb-3 h-3 w-16 rounded-full" />
        <div className="hero-weather-skeleton mb-2 h-10 w-20 rounded-lg" />
        <div className="hero-weather-skeleton mb-4 h-3 w-28 rounded-full" />
        <div className="grid grid-cols-2 gap-2">
          <div className="hero-weather-skeleton h-10 rounded-xl" />
          <div className="hero-weather-skeleton h-10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (weather.status === "error") {
    return (
      <div className="hero-glass-widget hero-weather-widget p-4 text-center">
        <p className="eyebrow text-[0.58rem] text-[var(--gold)]/85">Пампорово</p>
        <p className="mt-3 text-sm text-white/55">Времето временно недостъпно</p>
      </div>
    );
  }

  const { data } = weather;
  const Icon = WEATHER_ICONS[data.icon];

  return (
    <div className="hero-glass-widget hero-weather-widget p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-[0.58rem] text-[var(--gold)]/85">Пампорово</p>
          <p className="mt-2 font-serif text-4xl leading-none text-white">
            {data.temperature}
            <span className="ml-0.5 text-2xl text-[var(--gold)]">°</span>
          </p>
          <p className="mt-1.5 text-[0.6875rem] text-white/50">
            Усеща се като {data.feelsLike}°
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
          <Icon className="h-5 w-5 text-[var(--gold)]" strokeWidth={1.75} />
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-white/85">{data.condition}</p>
      <p className="mt-1 text-[0.625rem] tracking-wide text-white/40">
        Днес {data.dailyMin}° – {data.dailyMax}° · 1 650 m
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-white/45">
            <Droplets className="h-3 w-3 text-[var(--gold)]/80" strokeWidth={1.75} />
            <span className="text-[0.5625rem] uppercase tracking-[0.12em]">Влажност</span>
          </div>
          <p className="mt-1 font-serif text-base leading-none text-white">{data.humidity}%</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-white/45">
            <Wind className="h-3 w-3 text-[var(--gold)]/80" strokeWidth={1.75} />
            <span className="text-[0.5625rem] uppercase tracking-[0.12em]">Вятър</span>
          </div>
          <p className="mt-1 font-serif text-base leading-none text-white">
            {data.windSpeed}{" "}
            <span className="font-sans text-[0.625rem] font-normal text-white/50">km/h</span>
          </p>
          <p className="mt-0.5 text-[0.5625rem] text-white/40">{formatWindSpeed(data.windSpeed)}</p>
        </div>
      </div>
    </div>
  );
}

export function HeroContactWidget({ className }: { className?: string }) {
  return (
    <div className={cn("hero-glass-widget hero-contact-widget p-4", className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/10">
          <MapPin className="h-4 w-4 text-[var(--gold)]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 text-left">
          <p className="eyebrow text-[0.58rem] text-[var(--gold)]/85">Локация</p>
          <p className="mt-1 text-sm leading-snug text-white/85">{CONTACT.address}</p>
        </div>
      </div>

      <a
        href={`tel:${CONTACT.phone}`}
        className="hero-contact-phone group mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3 transition hover:border-[var(--gold)]/35 hover:bg-white/[0.08]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15 transition group-hover:bg-[var(--gold)]/25">
          <Phone className="h-4 w-4 text-[var(--gold)]" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-[0.5625rem] uppercase tracking-[0.14em] text-white/45">
            Обадете се
          </span>
          <span className="mt-0.5 block font-serif text-lg leading-none text-white">
            {CONTACT.phoneDisplay}
          </span>
        </span>
      </a>

      <a
        href={PROPERTY_LOCATION.directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hero-contact-nav premium-btn mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.8125rem] font-medium tracking-wide"
      >
        <Navigation className="h-4 w-4" strokeWidth={1.75} />
        Навигирай до нас
      </a>
    </div>
  );
}
