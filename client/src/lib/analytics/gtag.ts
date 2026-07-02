export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "G-6W50FH0F0D";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let scriptLoaded = false;
let gaConfigured = false;

function ensureGtagStub() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Analytics"));
    document.head.appendChild(script);
  });
}

export async function applyConsent(analytics: boolean, functional: boolean) {
  ensureGtagStub();

  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: functional ? "granted" : "denied",
    personalization_storage: "denied",
  });

  if (!analytics) {
    return;
  }

  if (!scriptLoaded) {
    await loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
    scriptLoaded = true;
  }

  if (!gaConfigured) {
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });
    gaConfigured = true;
  }
}

export function isAnalyticsActive() {
  return gaConfigured;
}

export function trackPageView(pagePath: string) {
  if (!gaConfigured) return;
  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (!gaConfigured) return;
  window.gtag("event", eventName, params);
}
