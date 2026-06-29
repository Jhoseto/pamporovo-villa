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

export function useAdminPush() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  const { data: vapid } = trpc.admin.push.getVapidPublicKey.useQuery(undefined, {
    retry: false,
  });
  const subscribeMutation = trpc.admin.push.subscribe.useMutation();
  const unsubscribeMutation = trpc.admin.push.unsubscribe.useMutation();

  const registerSw = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return null;
    return navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" });
  }, []);

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
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast.error("Разрешението за известия е отказано");
        return;
      }

      const reg = await registerSw();
      if (!reg) {
        toast.error("Service worker не е наличен");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
      });

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
      toast.error(error instanceof Error ? error.message : "Грешка при абонамент");
    }
  }, [registerSw, subscribeMutation, vapid?.publicKey]);

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

  return {
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    vapidReady: !!vapid?.publicKey,
    isBusy: subscribeMutation.isPending || unsubscribeMutation.isPending,
  };
}
