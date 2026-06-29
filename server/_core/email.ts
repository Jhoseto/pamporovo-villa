import { bookingBalanceDue, formatAmountEur } from "../../shared/bookingPayment";
import { confirmationCardFilename } from "../../shared/confirmationCardFilename";
import { VILLA_LABELS, type VillaId } from "../../shared/villas";
import { bookingDatesFromRow } from "../bookingHelpers";
import type { BookingRequest } from "../../drizzle/schema";
import { ENV } from "./env";
import { sendSmtpMail } from "./smtpSend";

const SITE_NAME = "Pamporovo Villa";
const SITE_LOCATION = "к.к. Пампорово · местност Райковски ливади";
const SITE_EMAIL = "pamporovovilla@gmail.com";
const CHECK_IN_RULE = "След 15:00";
const CHECK_OUT_RULE = "До 11:00";

function formatBgDate(dateStr: string): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

function buildConfirmationContent(booking: BookingRequest) {
  const dates = bookingDatesFromRow(booking);
  const villa = VILLA_LABELS[booking.villaId as VillaId] ?? booking.villaId;
  const subject = `Потвърдена резервация — ${SITE_NAME}`;

  const lines = [
    `Здравейте, ${booking.guestName}!`,
    "",
    "Резервацията ви е потвърдена. Ето детайлите:",
    "",
    `Вила: ${villa}`,
    `Настаняване: ${formatBgDate(dates.checkIn)} (${CHECK_IN_RULE})`,
    `Напускане: ${formatBgDate(dates.checkOut)} (${CHECK_OUT_RULE})`,
    `Брой гости: ${booking.numberOfGuests}`,
    "",
    `Локация: ${SITE_LOCATION}`,
    "",
    "Моля, носете документ за самичност при настаняване.",
    "Тихи часове: 23:00 – 07:00. Пушенето е разрешено само на терасите.",
    "",
    `При въпроси: ${SITE_EMAIL}`,
    "",
    "До скоро!",
    SITE_NAME,
  ];

  const text = lines.join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:560px">
      <p>Здравейте, <strong>${escapeHtml(booking.guestName)}</strong>!</p>
      <p>Резервацията ви е <strong>потвърдена</strong>. Ето детайлите:</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:6px 0;color:#666">Вила</td><td><strong>${escapeHtml(villa)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">Настаняване</td><td><strong>${formatBgDate(dates.checkIn)}</strong> (${CHECK_IN_RULE})</td></tr>
        <tr><td style="padding:6px 0;color:#666">Напускане</td><td><strong>${formatBgDate(dates.checkOut)}</strong> (${CHECK_OUT_RULE})</td></tr>
        <tr><td style="padding:6px 0;color:#666">Гости</td><td><strong>${booking.numberOfGuests}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">Локация</td><td>${escapeHtml(SITE_LOCATION)}</td></tr>
      </table>
      <p style="font-size:14px;color:#444">Моля, носете документ за самоличност при настаняване. Тихи часове: 23:00 – 07:00.</p>
      <p style="font-size:14px;color:#444">При въпроси: <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a></p>
      <p>До скоро!<br><strong>${SITE_NAME}</strong></p>
    </div>
  `.trim();

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isEmailConfigured(): boolean {
  return Boolean(ENV.smtpHost && ENV.smtpUser && ENV.smtpPass && ENV.smtpFrom);
}

export async function sendBookingConfirmationEmail(booking: BookingRequest): Promise<boolean> {
  const to = booking.guestEmail?.trim();
  if (!to) return false;

  const { subject, text, html } = buildConfirmationContent(booking);

  if (!isEmailConfigured()) {
    console.info("[Email] SMTP not configured — confirmation preview:\n", text);
    return false;
  }

  await sendSmtpMail({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    user: ENV.smtpUser,
    pass: ENV.smtpPass,
    from: ENV.smtpFrom,
    to,
    subject,
    text,
    html,
  });

  console.info(`[Email] Confirmation sent to ${to} for booking #${booking.id}`);
  return true;
}

export async function sendBookingConfirmationById(bookingId: number): Promise<boolean> {
  const db = await import("../db");
  const booking = await db.getBookingById(bookingId);
  if (!booking || booking.status !== "confirmed") return false;
  try {
    return await sendBookingConfirmationEmail(booking);
  } catch (error) {
    console.warn("[Email] Failed to send confirmation:", error);
    return false;
  }
}

function buildCardEmailContent(booking: BookingRequest) {
  const dates = bookingDatesFromRow(booking);
  const villa = VILLA_LABELS[booking.villaId as VillaId] ?? booking.villaId;
  const total = booking.totalAmountEur ?? 0;
  const deposit = booking.depositPaidEur ?? 0;
  const balance = bookingBalanceDue(total, deposit) ?? 0;
  const subject = `Потвърдена резервация — ${SITE_NAME}`;

  const text = [
    `Здравейте, ${booking.guestName}!`,
    "",
    "Резервацията ви е потвърдена. Прикачена е карта с детайлите.",
    "",
    `${villa}`,
    `${formatBgDate(dates.checkIn)} → ${formatBgDate(dates.checkOut)}`,
    `Общо: ${formatAmountEur(total)} · Капаро: ${formatAmountEur(deposit)} · Остава: ${formatAmountEur(balance)}`,
    "",
    SITE_NAME,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:560px">
      <p>Здравейте, <strong>${escapeHtml(booking.guestName)}</strong>!</p>
      <p>Резервацията ви е <strong>потвърдена</strong>. Прикачена е карта с детайлите (JPG).</p>
      <p><strong>${escapeHtml(villa)}</strong><br>
      ${formatBgDate(dates.checkIn)} → ${formatBgDate(dates.checkOut)}</p>
      <p>Общо: <strong>${formatAmountEur(total)}</strong><br>
      Капаро: <strong>${formatAmountEur(deposit)}</strong><br>
      Остава: <strong>${formatAmountEur(balance)}</strong></p>
      <p>${SITE_NAME}</p>
    </div>
  `.trim();

  return { subject, text, html };
}

export async function sendBookingConfirmationCardEmail(
  booking: BookingRequest,
  imageJpeg: Buffer
): Promise<boolean> {
  const to = booking.guestEmail?.trim();
  if (!to) return false;

  const { subject, text, html } = buildCardEmailContent(booking);
  const dates = bookingDatesFromRow(booking);

  if (!isEmailConfigured()) {
    console.info("[Email] SMTP not configured — card email preview:\n", text);
    return false;
  }

  await sendSmtpMail({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    user: ENV.smtpUser,
    pass: ENV.smtpPass,
    from: ENV.smtpFrom,
    to,
    subject,
    text,
    html,
    attachments: [
      {
        filename: confirmationCardFilename({
          guestName: booking.guestName,
          guestPhone: booking.guestPhone,
          checkInDate: dates.checkIn,
        }),
        content: imageJpeg,
        contentType: "image/jpeg",
      },
    ],
  });

  console.info(`[Email] Confirmation card sent to ${to} for booking #${booking.id}`);
  return true;
}
