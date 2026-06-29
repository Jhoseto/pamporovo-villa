import { VILLA_LABELS, type VillaId } from "../shared/villas";
import { formatDateOnly } from "./bookingHelpers";
import * as db from "./db";
import { notifyTomorrowCheckIns } from "./_core/push";

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d! + days));
  return formatDateOnly(date);
}

export async function runDailyCheckInReminders(): Promise<{ sent: boolean; count: number }> {
  const tomorrow = addDaysStr(formatDateOnly(new Date()), 1);
  const reminderKey = `checkin-${tomorrow}`;

  if (await db.hasReminderBeenSent(reminderKey)) {
    return { sent: false, count: 0 };
  }

  const bookings = await db.getConfirmedCheckInsOn(tomorrow);
  if (bookings.length === 0) {
    await db.markReminderSent(reminderKey);
    return { sent: false, count: 0 };
  }

  await notifyTomorrowCheckIns(
    bookings.map(b => ({
      id: b.id,
      guestName: b.guestName,
      villaLabel: VILLA_LABELS[b.villaId as VillaId] ?? b.villaId,
      checkInDate: formatDateOnly(b.checkInDate),
    })),
    tomorrow
  );
  await db.markReminderSent(reminderKey);

  return { sent: true, count: bookings.length };
}
