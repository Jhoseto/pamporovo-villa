import { useEffect, useState } from "react";
import { fetchPamporovoWeather, type WeatherSnapshot } from "@/lib/weather";

type WeatherState =
  | { status: "loading" }
  | { status: "ready"; data: WeatherSnapshot }
  | { status: "error" };

export function usePamporovoWeather() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchPamporovoWeather()
      .then(data => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
