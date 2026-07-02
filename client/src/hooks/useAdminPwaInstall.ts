import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAdminPwaPlatform,
  isAdminPwaStandalone,
  isIosNonSafariBrowser,
  isIosSafariBrowser,
  waitForAdminServiceWorker,
  type AdminPwaPlatform,
} from "@/lib/adminPwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __pvAdminInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const DISMISS_KEY = "pamporovo-admin-pwa-banner-dismissed";

/**
 * beforeinstallprompt fires ONCE, usually before React mounts. The index.html
 * bootstrap stashes it on window.__pvAdminInstallPrompt. This module keeps a
 * single shared prompt + installed flag so every hook instance (settings page,
 * banners, login) sees the same state regardless of when it mounted.
 */
let sharedPrompt: BeforeInstallPromptEvent | null = null;
let sharedInstalled = false;
const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach(fn => fn());
}

function initSharedState() {
  if (typeof window === "undefined") return;
  if (!sharedPrompt && window.__pvAdminInstallPrompt) {
    sharedPrompt = window.__pvAdminInstallPrompt;
  }
}

if (typeof window !== "undefined") {
  // Fallback capture in case the index.html bootstrap didn't run (e.g. dev HMR).
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    sharedPrompt = event as BeforeInstallPromptEvent;
    window.__pvAdminInstallPrompt = sharedPrompt;
    notifyAll();
  });
  window.addEventListener("pv-admin-install-prompt", () => {
    initSharedState();
    notifyAll();
  });
  const markInstalled = () => {
    sharedPrompt = null;
    window.__pvAdminInstallPrompt = null;
    sharedInstalled = true;
    localStorage.setItem(DISMISS_KEY, "1");
    notifyAll();
  };
  window.addEventListener("appinstalled", markInstalled);
  window.addEventListener("pv-admin-installed", markInstalled);
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function useAdminPwaInstall() {
  const [, forceRender] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1"
  );
  const platform = getAdminPwaPlatform();
  const iosNonSafari = isIosNonSafariBrowser();
  const iosSafari = isIosSafariBrowser();

  initSharedState();
  const canInstall = !!sharedPrompt;
  const isInstalled = sharedInstalled || isAdminPwaStandalone();

  useEffect(() => {
    const rerender = () => forceRender(n => n + 1);
    listeners.add(rerender);
    void waitForAdminServiceWorker().then(ok => setSwReady(ok));
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  const install = useCallback(async () => {
    if (isInstalled) return true;

    if (platform === "ios") {
      toast.message("iPhone: Safari → Сподели → Добави на началния екран", { duration: 6000 });
      return false;
    }

    initSharedState();
    const prompt = sharedPrompt;
    if (!prompt) {
      if (platform === "android") {
        toast.message(
          "Ако бутонът не отвори прозорец: Chrome → меню (⋮) → „Добавяне към началния екран“ / „Инсталиране на приложение“.",
          { duration: 9000 }
        );
      } else {
        toast.error("Инсталацията не е налична — ползвайте Chrome или Edge");
      }
      return false;
    }

    setIsInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      // The prompt can only be used once — clear it regardless of outcome.
      sharedPrompt = null;
      if (typeof window !== "undefined") window.__pvAdminInstallPrompt = null;
      if (choice.outcome === "accepted") {
        sharedInstalled = true;
        localStorage.setItem(DISMISS_KEY, "1");
        toast.success("Приложението е инсталирано — отворете го от иконата на началния екран");
        notifyAll();
        return true;
      }
      notifyAll();
      return false;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Грешка при инсталация");
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, [isInstalled, platform]);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }, []);

  const showIosInstructions = platform === "ios" && !isInstalled;
  // Android/desktop: always show the button when not installed; if the native
  // prompt isn't captured yet, clicking it explains the manual Chrome-menu path.
  const showInstallButton = !isInstalled && platform !== "ios";
  const installButtonEnabled = !isInstalling;
  const installButtonLabel = isInstalling
    ? "Инсталиране..."
    : "Инсталирай приложението";

  const installStatusLabel = isInstalled
    ? "Инсталирано — отворете от иконата на началния екран"
    : canInstall
      ? "Готово за инсталация"
      : platform === "ios"
        ? iosNonSafari
          ? "Отворете в Safari за истинско приложение"
          : iosSafari
            ? "Готово — добавете от Safari (виж инструкциите)"
            : "Добавете на началния екран от Safari"
        : platform === "android"
          ? "Натиснете бутона за инсталация"
          : swReady
            ? "Изчаква се потвърждение от браузъра..."
            : "Подготвя се...";

  const showBanner = isMobileDevice() && !isInstalled && !dismissed;

  return {
    canInstall,
    isInstalled,
    isInstalling,
    install,
    showIosInstructions,
    iosNonSafari,
    iosSafari,
    isIos: platform === "ios",
    platform,
    swReady,
    showBanner,
    dismissBanner,
    showInstallButton,
    installButtonEnabled,
    installButtonLabel,
    installStatusLabel,
  };
}

export type { AdminPwaPlatform };
