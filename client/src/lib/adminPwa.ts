export function isAdminPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return true;
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" });
  } catch (error) {
    console.warn("[PWA] Service worker registration failed:", error);
    return null;
  }
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

export function setupAdminPwaMeta(): () => void {
  const created: HTMLElement[] = [];

  const add = (tag: string, attrs: Record<string, string>) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    document.head.appendChild(el);
    created.push(el);
  };

  add("link", { rel: "manifest", href: "/admin/manifest.webmanifest" });
  add("link", { rel: "apple-touch-icon", href: "/admin/icons/icon-180.png" });
  add("link", { rel: "icon", type: "image/png", sizes: "192x192", href: "/admin/icons/icon-192.png" });
  add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
  add("meta", { name: "apple-mobile-web-app-title", content: "PV Админ" });
  add("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" });
  add("meta", { name: "mobile-web-app-capable", content: "yes" });
  add("meta", { name: "application-name", content: "PV Админ" });
  add("meta", { name: "format-detection", content: "telephone=no" });

  return () => {
    created.forEach(el => el.remove());
  };
}
