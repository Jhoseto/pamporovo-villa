self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

function notifyClientsToPlaySound(soundUrl) {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: "PLAY_NOTIFICATION_SOUND", url: soundUrl });
    });
  });
}

self.addEventListener("push", event => {
  let payload = {
    title: "Pamporovo Villa",
    body: "Нова резервация",
    url: "/admin/bookings",
    tag: "booking",
    soundUrl: "/admin/sounds/notification-default.wav",
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    /* ignore malformed payload */
  }

  const soundUrl = payload.soundUrl || payload.data?.soundUrl || "/admin/sounds/notification-default.wav";

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/admin/icons/icon-192.svg",
        badge: payload.badge || "/admin/icons/badge-72.svg",
        tag: payload.tag,
        renotify: payload.renotify ?? true,
        requireInteraction: payload.requireInteraction ?? true,
        vibrate: payload.vibrate || [200, 100, 200, 100, 200],
        silent: false,
        data: { url: payload.data?.url || payload.url || "/admin/bookings", soundUrl },
      });
      await notifyClientsToPlaySound(soundUrl);
    })()
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/admin/bookings", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes("/admin")) {
          if ("navigate" in client && typeof client.navigate === "function") {
            return client.navigate(targetUrl).then(() => client.focus());
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
