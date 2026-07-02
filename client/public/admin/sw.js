const CACHE_NAME = "pv-admin-v2";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch handler — REQUIRED for Chrome PWA installability (beforeinstallprompt).
 * Strategy: network-first; cache successful navigation responses for offline fallback.
 */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && (event.request.mode === "navigate" || event.request.destination === "document")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || Response.error()))
  );
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
        icon: payload.icon || "/admin/icons/icon-192.png",
        badge: payload.badge || "/admin/icons/badge-72.png",
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
