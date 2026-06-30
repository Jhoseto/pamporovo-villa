import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function useAdminPwaInstall() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isPwaInstalled);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsInstalled(isPwaInstalled());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const onInstalled = () => {
      deferredPrompt.current = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

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

  const isIos = isIosDevice();
  const showIosInstructions = isIos && !isInstalled && !canInstall;

  return {
    canInstall,
    isInstalled,
    isInstalling,
    install,
    showIosInstructions,
    isIos,
  };
}
