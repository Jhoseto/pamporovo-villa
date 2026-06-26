self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {
  let payload = {
    title: "Pamporovo Villa",
    body: "Нова резервация",
    url: "/admin/bookings",
    tag: "booking",
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    /* ignore malformed payload */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/admin/icons/icon-192.svg",
      badge: payload.badge || "/admin/icons/badge-72.svg",
      tag: payload.tag,
      renotify: payload.renotify ?? true,
      requireInteraction: payload.requireInteraction ?? true,
      vibrate: payload.vibrate || [200, 100, 200, 100, 200],
      silent: false,
      data: { url: payload.data?.url || payload.url || "/admin/bookings" },
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/admin/bookings";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes("/admin")) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
