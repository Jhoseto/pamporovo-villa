import { bookingBalanceDue, formatAmountEur } from "../../shared/bookingPayment";
import { confirmationCardFilename } from "../../shared/confirmationCardFilename";
import { VILLA_LABELS, type VillaId } from "../../shared/villas";
import { bookingDatesFromRow } from "../bookingHelpers";
import type { BookingRequest } from "../../drizzle/schema";
import { ENV } from "./env";
import { getEmailProvider, isEmailConfigured, sendMail } from "./mailSend";

const SITE_NAME = "Pamporovo Villa";
const SITE_LOCATION = "к.к. Пампорово · местност Райковски ливади";
const CHECK_IN_RULE = "След 15:00";
const CHECK_OUT_RULE = "До 11:00";

function supportEmail(): string {
  return ENV.supportEmail;
}

function formatBgDate(dateStr: string): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

function buildConfirmationContent(booking: BookingRequest) {
  const dates = bookingDatesFromRow(booking);
  const villa = VILLA_LABELS[booking.villaId as VillaId] ?? booking.villaId;
  const subject = `\u041f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430 \u0440\u0435\u0437\u0435\u0440\u0432\u0430\u0446\u0438\u044f \u2014 ${SITE_NAME}`;

  const lines = [
    `\u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435, ${booking.guestName}!`,
    "",
    "\u0420\u0435\u0437\u0435\u0440\u0432\u0430\u0446\u0438\u044f\u0442\u0430 \u0432\u0438 \u0435 \u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430. \u0415\u0442\u043e \u0434\u0435\u0442\u0430\u0439\u043b\u0438\u0442\u0435:",
    "",
    `\u0412\u0438\u043b\u0430: ${villa}`,
    `\u041d\u0430\u0441\u0442\u0430\u043d\u044f\u0432\u0430\u043d\u0435: ${formatBgDate(dates.checkIn)} (${CHECK_IN_RULE})`,
    `\u041d\u0430\u043f\u0443\u0441\u043a\u0430\u043d\u0435: ${formatBgDate(dates.checkOut)} (${CHECK_OUT_RULE})`,
    `\u0411\u0440\u043e\u0439 \u0433\u043e\u0441\u0442\u0438: ${booking.numberOfGuests}`,
    "",
    `\u041b\u043e\u043a\u0430\u0446\u0438\u044f: ${SITE_LOCATION}`,
    "",
    "\u041c\u043e\u043b\u044f, \u043d\u043e\u0441\u0435\u0442\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0437\u0430 \u0441\u0430\u043c\u043e\u043b\u0438\u0447\u043d\u043e\u0441\u0442 \u043f\u0440\u0438 \u043d\u0430\u0441\u0442\u0430\u043d\u044f\u0432\u0430\u043d\u0435.",
    "\u0422\u0438\u0445\u0438 \u0447\u0430\u0441\u043e\u0432\u0435: 23:00 \u2013 07:00. \u041f\u0443\u0448\u0435\u043d\u0435\u0442\u043e \u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u043e \u0441\u0430\u043c\u043e \u043d\u0430 \u0442\u0435\u0440\u0430\u0441\u0438\u0442\u0435.",
    "",
    `\u041f\u0440\u0438 \u0432\u044a\u043f\u0440\u043e\u0441\u0438: ${supportEmail()}`,
    "",
    "\u0414\u043e \u0441\u043a\u043e\u0440\u043e!",
    SITE_NAME,
  ];

  const text = lines.join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:560px">
      <p>\u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435, <strong>${escapeHtml(booking.guestName)}</strong>!</p>
      <p>\u0420\u0435\u0437\u0435\u0440\u0432\u0430\u0446\u0438\u044f\u0442\u0430 \u0432\u0438 \u0435 <strong>\u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430</strong>. \u0415\u0442\u043e \u0434\u0435\u0442\u0430\u0439\u043b\u0438\u0442\u0435:</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:6px 0;color:#666">\u0412\u0438\u043b\u0430</td><td><strong>${escapeHtml(villa)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">\u041d\u0430\u0441\u0442\u0430\u043d\u044f\u0432\u0430\u043d\u0435</td><td><strong>${formatBgDate(dates.checkIn)}</strong> (${CHECK_IN_RULE})</td></tr>
        <tr><td style="padding:6px 0;color:#666">\u041d\u0430\u043f\u0443\u0441\u043a\u0430\u043d\u0435</td><td><strong>${formatBgDate(dates.checkOut)}</strong> (${CHECK_OUT_RULE})</td></tr>
        <tr><td style="padding:6px 0;color:#666">\u0413\u043e\u0441\u0442\u0438</td><td><strong>${booking.numberOfGuests}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">\u041b\u043e\u043a\u0430\u0446\u0438\u044f</td><td>${escapeHtml(SITE_LOCATION)}</td></tr>
      </table>
      <p style="font-size:14px;color:#444">\u041c\u043e\u043b\u044f, \u043d\u043e\u0441\u0435\u0442\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0437\u0430 \u0441\u0430\u043c\u043e\u043b\u0438\u0447\u043d\u043e\u0441\u0442 \u043f\u0440\u0438 \u043d\u0430\u0441\u0442\u0430\u043d\u044f\u0432\u0430\u043d\u0435. \u0422\u0438\u0445\u0438 \u0447\u0430\u0441\u043e\u0432\u0435: 23:00 \u2013 07:00.</p>
      <p style="font-size:14px;color:#444">\u041f\u0440\u0438 \u0432\u044a\u043f\u0440\u043e\u0441\u0438: <a href="mailto:${supportEmail()}">${supportEmail()}</a></p>
      <p>\u0414\u043e \u0441\u043a\u043e\u0440\u043e!<br><strong>${SITE_NAME}</strong></p>
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

export { getEmailProvider, isEmailConfigured };

export async function sendBookingConfirmationEmail(booking: BookingRequest): Promise<boolean> {
  const to = booking.guestEmail?.trim();
  if (!to) return false;

  const { subject, text, html } = buildConfirmationContent(booking);

  if (!isEmailConfigured()) {
    console.info("[Email] Provider not configured — confirmation preview:\n", text);
    return false;
  }

  await sendMail({
    to,
    subject,
    text,
    html,
    replyTo: ENV.smtpReplyTo,
  });
  console.info(`[Email] Confirmation sent to ${to} for booking #${booking.id} via ${getEmailProvider()}`);
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
  const subject = `\u041f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430 \u0440\u0435\u0437\u0435\u0440\u0432\u0430\u0446\u0438\u044f \u2014 ${SITE_NAME}`;

  const text = [
    `\u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435, ${booking.guestName}!`,
    "",
    "\u0420\u0435\u0437\u0435\u0440\u0432\u0430\u0446\u0438\u044f\u0442\u0430 \u0432\u0438 \u0435 \u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430. \u041f\u0440\u0438\u043a\u0430\u0447\u0435\u043d\u0430 \u0435 \u043a\u0430\u0440\u0442\u0430 \u0441 \u0434\u0435\u0442\u0430\u0439\u043b\u0438\u0442\u0435.",
    "",
    `${villa}`,
    `${formatBgDate(dates.checkIn)} \u2192 ${formatBgDate(dates.checkOut)}`,
    `\u041e\u0431\u0449\u043e: ${formatAmountEur(total)} \u00b7 \u041a\u0430\u043f\u0430\u0440\u043e: ${formatAmountEur(deposit)} \u00b7 \u041e\u0441\u0442\u0430\u0432\u0430: ${formatAmountEur(balance)}`,
    "",
    `\u041f\u0440\u0438 \u0432\u044a\u043f\u0440\u043e\u0441\u0438: ${supportEmail()}`,
    "",
    SITE_NAME,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:560px">
      <p>\u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435, <strong>${escapeHtml(booking.guestName)}</strong>!</p>
      <p>\u0420\u0435\u0437\u0435\u0440\u0432\u0430\u0446\u0438\u044f\u0442\u0430 \u0432\u0438 \u0435 <strong>\u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u0430</strong>. \u041f\u0440\u0438\u043a\u0430\u0447\u0435\u043d\u0430 \u0435 \u043a\u0430\u0440\u0442\u0430 \u0441 \u0434\u0435\u0442\u0430\u0439\u043b\u0438\u0442\u0435 (JPG).</p>
      <p><strong>${escapeHtml(villa)}</strong><br>
      ${formatBgDate(dates.checkIn)} \u2192 ${formatBgDate(dates.checkOut)}</p>
      <p>\u041e\u0431\u0449\u043e: <strong>${formatAmountEur(total)}</strong><br>
      \u041a\u0430\u043f\u0430\u0440\u043e: <strong>${formatAmountEur(deposit)}</strong><br>
      \u041e\u0441\u0442\u0430\u0432\u0430: <strong>${formatAmountEur(balance)}</strong></p>
      <p style="font-size:14px;color:#444">\u041f\u0440\u0438 \u0432\u044a\u043f\u0440\u043e\u0441\u0438: <a href="mailto:${supportEmail()}">${supportEmail()}</a></p>
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
    console.info("[Email] Provider not configured — card email preview:\n", text);
    return false;
  }

  await sendMail({
    to,
    subject,
    text,
    html,
    replyTo: ENV.smtpReplyTo,
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

  console.info(`[Email] Confirmation card sent to ${to} for booking #${booking.id} via ${getEmailProvider()}`);
  return true;
}
