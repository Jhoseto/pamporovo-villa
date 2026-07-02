import {
  getAdminPwaPlatform,
  isAdminPwaStandalone,
  isIosNonSafariBrowser,
  registerAdminServiceWorker,
  type AdminPwaPlatform,
} from "@/lib/adminPwa";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function getPushDeniedInstructions(platform: AdminPwaPlatform, standalone: boolean): string {
  if (platform === "ios") {
    if (!standalone) {
      return "На iPhone първо инсталирайте PV Админ от Safari (Добави на началния екран) и отворете от иконата.";
    }
    return "Известията са блокирани. Отворете Настройки → Известия → PV Админ → разрешете известията, после се върнете тук.";
  }
  if (platform === "android") {
    return "Известията са блокирани. Chrome → икона на катинар → Настройки на сайта → Известия → Разрешено.";
  }
  return "Известията са блокирани в браузъра. Разрешете ги от настройките на сайта.";
}

function syncNotificationPermission(): NotificationPermission {
  if (typeof Notification === "undefined") return "denied";
  return Notification.permission;
}

export function useAdminPush() {
  const [permission, setPermission] = useState<NotificationPermission>(syncNotificationPermission);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const platform = getAdminPwaPlatform();
  const standalone = isAdminPwaStandalone();

  const { data: vapid } = trpc.admin.push.getVapidPublicKey.useQuery(undefined, {
    retry: false,
  });
  const subscribeMutation = trpc.admin.push.subscribe.useMutation();
  const unsubscribeMutation = trpc.admin.push.unsubscribe.useMutation();

  const registerSw = useCallback(async () => registerAdminServiceWorker(), []);

  const syncSubscriptionState = useCallback(async () => {
    try {
      const reg = await registerSw();
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (sub?.endpoint) {
        setIsSubscribed(true);
        setCurrentEndpoint(sub.endpoint);
      } else {
        setIsSubscribed(false);
        setCurrentEndpoint(null);
      }
    } catch {
      setIsSubscribed(false);
      setCurrentEndpoint(null);
    }
  }, [registerSw]);

  const subscribe = useCallback(async () => {
    if (!vapid?.publicKey) {
      toast.error("Push не е конфигуриран на сървъра");
      return;
    }

    if (typeof Notification === "undefined" || !("PushManager" in window)) {
      toast.error("Този браузър не поддържа push известия");
      return;
    }

    if (platform === "ios" && isIosNonSafariBrowser()) {
      toast.message("На iPhone отворете admin панела в Safari или от иконата PV Админ.", { duration: 7000 });
      return;
    }

    if (platform === "ios" && !standalone) {
      toast.message(
        "На iPhone push работи само от инсталираното приложение. Safari → Сподели → Добави на началния екран → отворете PV Админ.",
        { duration: 9000 }
      );
      return;
    }

    const currentPerm = syncNotificationPermission();
    setPermission(currentPerm);

    if (currentPerm === "denied") {
      toast.error(getPushDeniedInstructions(platform, standalone), { duration: 10000 });
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "denied") {
        toast.error(getPushDeniedInstructions(platform, standalone), { duration: 10000 });
        return;
      }

      if (perm !== "granted") {
        toast.error("Разрешението не е дадено — опитайте отново");
        return;
      }

      const reg = await registerSw();
      if (!reg) {
        toast.error("Service worker не е наличен");
        return;
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
        });
      }

      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        toast.error("Неуспешен абонамент за известия");
        return;
      }

      await subscribeMutation.mutateAsync({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      });
      setIsSubscribed(true);
      setCurrentEndpoint(json.endpoint);
      toast.success("Известията са активирани");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Грешка при абонамент";
      if (/denied|not allowed|permission/i.test(message)) {
        toast.error(getPushDeniedInstructions(platform, standalone), { duration: 10000 });
        return;
      }
      toast.error(message);
    }
  }, [platform, registerSw, standalone, subscribeMutation, vapid?.publicKey]);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await registerSw();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await unsubscribeMutation.mutateAsync({ endpoint });
      } else if (currentEndpoint) {
        await unsubscribeMutation.mutateAsync({ endpoint: currentEndpoint });
      }
      setIsSubscribed(false);
      setCurrentEndpoint(null);
      toast.success("Известията са деактивирани");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Грешка при деактивиране");
    }
  }, [currentEndpoint, registerSw, unsubscribeMutation]);

  useEffect(() => {
    registerSw()
      .then(() => syncSubscriptionState())
      .catch(() => undefined);
  }, [registerSw, syncSubscriptionState]);

  useEffect(() => {
    const refreshPermission = () => setPermission(syncNotificationPermission());
    window.addEventListener("focus", refreshPermission);
    document.addEventListener("visibilitychange", refreshPermission);
    return () => {
      window.removeEventListener("focus", refreshPermission);
      document.removeEventListener("visibilitychange", refreshPermission);
    };
  }, []);

  return {
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    vapidReady: !!vapid?.publicKey,
    isBusy: subscribeMutation.isPending || unsubscribeMutation.isPending,
    platform,
    standalone,
    pushBlockedReason:
      permission === "denied"
        ? getPushDeniedInstructions(platform, standalone)
        : platform === "ios" && !standalone
          ? getPushDeniedInstructions(platform, standalone)
          : null,
  };
}
