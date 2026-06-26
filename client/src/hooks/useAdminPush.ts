import { useCallback, useEffect, useState } from "react";
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

  const { data: vapid } = trpc.admin.push.getVapidPublicKey.useQuery(undefined, {
    retry: false,
  });
  const subscribeMutation = trpc.admin.push.subscribe.useMutation();

  const registerSw = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return null;
    return navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" });
  }, []);

  const subscribe = useCallback(async () => {
    if (!vapid?.publicKey) return;
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return;

    const reg = await registerSw();
    if (!reg) return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
    });

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

    await subscribeMutation.mutateAsync({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    });
    setIsSubscribed(true);
  }, [registerSw, subscribeMutation, vapid?.publicKey]);

  useEffect(() => {
    registerSw().catch(() => undefined);
  }, [registerSw]);

  return {
    permission,
    isSubscribed,
    subscribe,
    vapidReady: !!vapid?.publicKey,
  };
}
