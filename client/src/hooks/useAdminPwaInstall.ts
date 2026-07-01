import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { isAdminPwaStandalone } from "@/lib/adminPwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "pamporovo-admin-pwa-banner-dismissed";

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function useAdminPwaInstall() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isAdminPwaStandalone);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsInstalled(isAdminPwaStandalone());

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
    const prompt = deferredPrompt.current;
    if (!prompt) {
      toast.error("Инсталацията не е налична в този браузър");
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
        toast.success("Приложението е инсталирано");
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Грешка при инсталация");
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, []);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowBanner(false);
  }, []);

  const isIos = isIosDevice();
  const showIosInstructions = isIos && !isInstalled && !canInstall;

  return {
    canInstall,
    isInstalled,
    isInstalling,
    install,
    showIosInstructions,
    isIos,
    showBanner: showBanner && !isInstalled,
    dismissBanner,
  };
}
