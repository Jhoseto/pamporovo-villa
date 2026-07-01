export const ADMIN_SW_URL = "/admin/sw.js";
export const ADMIN_SW_SCOPE = "/admin/";

export type AdminPwaPlatform = "ios" | "android" | "desktop";

/** iOS home-screen icons — must be opaque PNG (no alpha). */
export const ADMIN_APPLE_TOUCH_ICONS = [
  { href: "/admin/icons/icon-180.png", sizes: "180x180" },
  { href: "/admin/icons/icon-167.png", sizes: "167x167" },
  { href: "/admin/icons/icon-152.png", sizes: "152x152" },
] as const;

/** iOS launch images (portrait) — requires apple-mobile-web-app-capable. */
export const ADMIN_APPLE_STARTUP_IMAGES = [
  {
    href: "/admin/splash/launch-1170x2532.png",
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/admin/splash/launch-1284x2778.png",
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/admin/splash/launch-750x1334.png",
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
] as const;

export function isAdminPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export function getAdminPwaPlatform(): AdminPwaPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

export function isIosSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (!/iphone|ipad|ipod/i.test(ua)) return false;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
}

/** iOS Chrome/Firefox/Edge — cannot install a real standalone PWA. */
export function isIosNonSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (!/iphone|ipad|ipod/i.test(ua)) return false;
  return /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
}

export function isAdminPwaPath(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === "/admin" || path.startsWith("/admin/");
}

function ensureLink(rel: string, href: string, extra: Record<string, string> = {}) {
  const sizePart = extra.sizes ? `[sizes="${extra.sizes}"]` : "";
  const mediaPart = extra.media ? `[media="${extra.media}"]` : "";
  const selector = `link[rel="${rel}"][href="${href}"]${sizePart}${mediaPart}`;
  if (document.head.querySelector(selector)) return;

  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  Object.entries(extra).forEach(([key, value]) => link.setAttribute(key, value));
  document.head.appendChild(link);
}

function ensureMeta(name: string, content: string) {
  if (document.head.querySelector(`meta[name="${name}"]`)) return;
  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

function ensureThemeColor(content: string) {
  const existing = document.head.querySelector('meta[name="theme-color"]');
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const meta = document.createElement("meta");
  meta.setAttribute("name", "theme-color");
  meta.setAttribute("content", content);
  document.head.appendChild(meta);
}

/**
 * Idempotent — inject iOS + manifest head tags required for real standalone A2HS.
 * Call as early as possible on /admin routes (index.html bootstrap + SPA entry).
 */
export function initAdminPwaMeta(): void {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.adminPwaBootstrap = "1";

  ensureLink("manifest", "/admin/manifest.webmanifest");

  for (const icon of ADMIN_APPLE_TOUCH_ICONS) {
    ensureLink("apple-touch-icon", icon.href, { sizes: icon.sizes });
  }

  for (const splash of ADMIN_APPLE_STARTUP_IMAGES) {
    ensureLink("apple-touch-startup-image", splash.href, { media: splash.media });
  }

  ensureLink("icon", "/admin/icons/icon-192.png", { type: "image/png", sizes: "192x192" });
  ensureMeta("apple-mobile-web-app-capable", "yes");
  ensureMeta("apple-mobile-web-app-title", "PV Админ");
  ensureMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
  ensureMeta("mobile-web-app-capable", "yes");
  ensureMeta("application-name", "PV Админ");
  ensureMeta("format-detection", "telephone=no");
  ensureThemeColor("#efeae1");
}

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(ADMIN_SW_URL, { scope: ADMIN_SW_SCOPE });
  } catch (error) {
    console.warn("[PWA] Service worker registration failed:", error);
    return null;
  }
}

export async function waitForAdminServiceWorker(timeoutMs = 8000): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await registerAdminServiceWorker();
  if (!reg) return false;
  if (reg.active) return true;

  return new Promise(resolve => {
    const timer = window.setTimeout(() => resolve(Boolean(reg.active)), timeoutMs);
    const finish = (ok: boolean) => {
      window.clearTimeout(timer);
      resolve(ok);
    };

    if (navigator.serviceWorker.controller) {
      finish(true);
      return;
    }

    navigator.serviceWorker.ready.then(() => finish(true)).catch(() => finish(false));
  });
}

export function applyAdminPwaStandaloneClass(): () => void {
  const root = document.documentElement;
  const sync = () => {
    root.classList.toggle("admin-pwa-standalone", isAdminPwaStandalone());
  };

  sync();

  const media = window.matchMedia("(display-mode: standalone)");
  const onChange = () => sync();
  media.addEventListener("change", onChange);

  return () => {
    root.classList.remove("admin-pwa-standalone");
    media.removeEventListener("change", onChange);
  };
}

/** @deprecated Use initAdminPwaMeta — kept for AdminApp cleanup compatibility */
export function setupAdminPwaMeta(): () => void {
  initAdminPwaMeta();
  return () => undefined;
}
