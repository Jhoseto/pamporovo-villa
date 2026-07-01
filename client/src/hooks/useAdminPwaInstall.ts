import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getAdminPwaPlatform,
  isAdminPwaStandalone,
  isIosNonSafariBrowser,
  isIosSafariBrowser,
  registerAdminServiceWorker,
  waitForAdminServiceWorker,
  type AdminPwaPlatform,
} from "@/lib/adminPwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "pamporovo-admin-pwa-banner-dismissed";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function useAdminPwaInstall() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isAdminPwaStandalone);
  const [isInstalling, setIsInstalling] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const platform = getAdminPwaPlatform();
  const iosNonSafari = isIosNonSafariBrowser();

  useEffect(() => {
    setIsInstalled(isAdminPwaStandalone());

    void waitForAdminServiceWorker().then(ok => setSwReady(ok));

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const onInstalled = () => {
      deferredPrompt.current = null;
      setCanInstall(false);
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem(DISMISS_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const mobile = isMobileDevice();
    const standalone = isAdminPwaStandalone();
    setShowBanner(mobile && !standalone && !dismissed);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (canInstall && !isInstalled) {
      setShowBanner(true);
    }
  }, [canInstall, isInstalled]);

  const install = useCallback(async () => {
    if (isInstalled) return true;

    if (platform === "ios") {
      toast.message("iPhone: Safari → Сподели → Добави на началния екран", { duration: 6000 });
      return false;
    }

    const prompt = deferredPrompt.current;
    if (!prompt) {
      if (platform === "android") {
        toast.error("Изчакайте „Готово за инсталация“ или презаредете страницата в Chrome");
      } else {
        toast.error("Инсталацията не е налична — ползвайте Chrome или Edge");
      }
      return false;
    }

    setIsInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") {
        deferredPrompt.current = null;
        setCanInstall(false);
        setIsInstalled(true);
        setShowBanner(false);
        localStorage.setItem(DISMISS_KEY, "1");
        toast.success("Приложението е инсталирано — отворете го от иконата на началния екран");
        return true;
      }
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
    setShowBanner(false);
  }, []);

  const showIosInstructions = platform === "ios" && !isInstalled;
  const iosSafari = isIosSafariBrowser();
  const showInstallButton = !isInstalled && platform !== "ios";
  const installButtonEnabled = canInstall && swReady && !isInstalling;
  const installButtonLabel = isInstalling
    ? "Инсталиране..."
    : canInstall
      ? "Инсталирай приложението"
      : swReady
        ? "Подготовка..."
        : "Подготовка на приложението...";

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
        : swReady
          ? "Изчаква се потвърждение от Chrome..."
          : "Подготвя се...";

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
    showBanner: showBanner && !isInstalled,
    dismissBanner,
    showInstallButton,
    installButtonEnabled,
    installButtonLabel,
    installStatusLabel,
  };
}

export type { AdminPwaPlatform };
