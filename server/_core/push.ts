import { DEFAULT_NOTIFICATION_SOUND_URL, resolveNotificationSoundUrl } from "@shared/notificationSound";
import webpush from "web-push";
import { ENV } from "./env";
import * as db from "../db";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  soundUrl?: string;
};

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) {
    console.warn("[Push] VAPID keys not configured — push disabled");
    return;
  }
  webpush.setVapidDetails(ENV.vapidSubject, ENV.vapidPublicKey, ENV.vapidPrivateKey);
  configured = true;
}

export function getVapidPublicKey(): string | null {
  return ENV.vapidPublicKey || null;
}

export async function notifyAdmins(payload: PushPayload, excludeAdminUserId?: number) {
  ensureConfigured();
  if (!configured) return;

  const subscriptions = await db.getPushSubscriptions(excludeAdminUserId);
  await sendToSubscriptions(subscriptions, payload);
}

/** Send push only to a specific admin (e.g. test notification). */
export async function notifyAdminUser(adminUserId: number, payload: PushPayload) {
  ensureConfigured();
  if (!configured) return;

  const all = await db.getPushSubscriptions();
  const subscriptions = all.filter(s => s.adminUserId === adminUserId);
  await sendToSubscriptions(subscriptions, payload);
}

async function sendToSubscriptions(
  subscriptions: Awaited<ReturnType<typeof db.getPushSubscriptions>>,
  payload: PushPayload
) {
  if (subscriptions.length === 0) return;

  await Promise.allSettled(
    subscriptions.map(async sub => {
      const adminUser = await db.getAdminUserById(sub.adminUserId);
      const soundUrl =
        payload.soundUrl ??
        (adminUser
          ? resolveNotificationSoundUrl(adminUser)
          : DEFAULT_NOTIFICATION_SOUND_URL);

      const message = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: "/admin/icons/icon-192.png",
        badge: "/admin/icons/badge-72.png",
        tag: payload.tag,
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        silent: false,
        soundUrl,
        data: { url: payload.url, soundUrl },
      });

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message,
          { urgency: "high", TTL: 86400 }
        );
      } catch (error: unknown) {
        const status = (error as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await db.deletePushSubscription(sub.endpoint);
        }
        console.warn("[Push] Failed to send:", error);
      }
    })
  );
}

export async function notifyNewWebsiteBooking(booking: {
  id: number;
  guestName: string;
  villaId: string;
  checkInDate: string;
  checkOutDate: string;
}) {
  await notifyAdmins({
    title: "Ново запитване за резервация",
    body: `${booking.guestName} · ${booking.villaId} · ${formatRange(booking.checkInDate, booking.checkOutDate)}`,
    url: `/admin/bookings/${booking.id}`,
    tag: `booking-${booking.id}`,
  });
}

export async function notifyManualBooking(
  booking: {
    id: number;
    guestName: string;
    villaId: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
  },
  createdByAdminId: number,
  creatorUsername: string
) {
  await notifyAdmins(
    {
      title: `Нова резервация от ${creatorUsername}`,
      body: `${booking.guestName} · ${booking.villaId} · ${formatRange(booking.checkInDate, booking.checkOutDate)} · ${booking.status}`,
      url: `/admin/bookings/${booking.id}`,
      tag: `booking-${booking.id}`,
    },
    createdByAdminId
  );
}

export async function notifyTomorrowCheckIns(
  bookings: { id: number; guestName: string; villaLabel: string; checkInDate: string }[],
  date: string
) {
  const preview = bookings
    .slice(0, 3)
    .map(b => `${b.guestName} (${b.villaLabel})`)
    .join(" · ");
  const suffix = bookings.length > 3 ? ` +${bookings.length - 3}` : "";

  await notifyAdmins({
    title: `Утре ${bookings.length} настанявания`,
    body: `${preview}${suffix}`,
    url: "/admin",
    tag: `checkin-reminder-${date}`,
  });
}

function formatRange(checkIn: string, checkOut: string): string {
  const fmt = (d: string) => {
    const [y, m, day] = d.slice(0, 10).split("-");
    return `${day}.${m}.${y}`;
  };
  return `${fmt(checkIn)} – ${fmt(checkOut)}`;
}
