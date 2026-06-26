import { PROPERTY_LOCATION } from "@/data/siteContent";

export type WeatherSnapshot = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  conditionShort: string;
  icon: WeatherIconKind;
  dailyMin: number;
  dailyMax: number;
  updatedAt: string;
};

export type WeatherIconKind =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "showers"
  | "thunderstorm";

type OpenMeteoResponse = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

const CACHE_KEY = "pamporovo-weather-v1";
const CACHE_TTL_MS = 15 * 60 * 1000;

const WEATHER_CODE_MAP: Record<number, { label: string; short: string; icon: WeatherIconKind }> = {
  0: { label: "Ясно", short: "Ясно", icon: "clear" },
  1: { label: "Предимно ясно", short: "Ясно", icon: "partly-cloudy" },
  2: { label: "Частична облачност", short: "Облачно", icon: "partly-cloudy" },
  3: { label: "Облачно", short: "Облачно", icon: "cloudy" },
  45: { label: "Мъгла", short: "Мъгла", icon: "fog" },
  48: { label: "Силна мъгла", short: "Мъгла", icon: "fog" },
  51: { label: "Лек ръмеж", short: "Ръмеж", icon: "drizzle" },
  53: { label: "Ръмеж", short: "Ръмеж", icon: "drizzle" },
  55: { label: "Силен ръмеж", short: "Ръмеж", icon: "drizzle" },
  56: { label: "Лек леден ръмеж", short: "Ръмеж", icon: "drizzle" },
  57: { label: "Леден ръмеж", short: "Ръмеж", icon: "drizzle" },
  61: { label: "Слаб дъжд", short: "Дъжд", icon: "rain" },
  63: { label: "Дъжд", short: "Дъжд", icon: "rain" },
  65: { label: "Силен дъжд", short: "Дъжд", icon: "rain" },
  66: { label: "Лек леден дъжд", short: "Дъжд", icon: "rain" },
  67: { label: "Леден дъжд", short: "Дъжд", icon: "rain" },
  71: { label: "Слаб сняг", short: "Сняг", icon: "snow" },
  73: { label: "Сняг", short: "Сняг", icon: "snow" },
  75: { label: "Силен сняг", short: "Сняг", icon: "snow" },
  77: { label: "Снежни зърна", short: "Сняг", icon: "snow" },
  80: { label: "Кратък дъжд", short: "Валежи", icon: "showers" },
  81: { label: "Валежи", short: "Валежи", icon: "showers" },
  82: { label: "Силни валежи", short: "Валежи", icon: "showers" },
  85: { label: "Слаб сняг", short: "Сняг", icon: "snow" },
  86: { label: "Силен сняг", short: "Сняг", icon: "snow" },
  95: { label: "Гръмотевици", short: "Буря", icon: "thunderstorm" },
  96: { label: "Градушка", short: "Буря", icon: "thunderstorm" },
  99: { label: "Силна градушка", short: "Буря", icon: "thunderstorm" },
};

function mapWeatherCode(code: number) {
  return (
    WEATHER_CODE_MAP[code] ?? {
      label: "Променливо",
      short: "Променливо",
      icon: "partly-cloudy" as const,
    }
  );
}

export function formatWindSpeed(speedKmh: number): string {
  if (speedKmh < 1) return "тих";
  if (speedKmh < 6) return "лек полъх";
  if (speedKmh < 12) return "слаб";
  if (speedKmh < 20) return "умерен";
  return "силен";
}

function parseResponse(data: OpenMeteoResponse): WeatherSnapshot {
  const mapped = mapWeatherCode(data.current.weather_code);

  return {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    condition: mapped.label,
    conditionShort: mapped.short,
    icon: mapped.icon,
    dailyMin: Math.round(data.daily.temperature_2m_min[0] ?? data.current.temperature_2m),
    dailyMax: Math.round(data.daily.temperature_2m_max[0] ?? data.current.temperature_2m),
    updatedAt: data.current.time,
  };
}

function readCache(): WeatherSnapshot | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { fetchedAt: number; data: WeatherSnapshot };
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: WeatherSnapshot) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data }));
  } catch {
    /* ignore quota errors */
  }
}

export async function fetchPamporovoWeather(): Promise<WeatherSnapshot> {
  const cached = readCache();
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: String(PROPERTY_LOCATION.lat),
    longitude: String(PROPERTY_LOCATION.lng),
    elevation: "1650",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: "1",
    timezone: "Europe/Sofia",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Weather fetch failed");

  const data = (await response.json()) as OpenMeteoResponse;
  const snapshot = parseResponse(data);
  writeCache(snapshot);
  return snapshot;
}
