import { bookingBalanceDue, formatAmountEur } from "@shared/bookingPayment";
import { CONFIRMATION_CARD, ensureConfirmationCardFonts } from "@shared/confirmationCardTheme";
import { VILLA_LABELS, type VillaId } from "@shared/villas";
import { SITE } from "@/data/siteContent";

export type ConfirmationCardData = {
  bookingId: number;
  guestName: string;
  villaId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  numberOfGuests: number;
  totalAmountEur: number;
  depositPaidEur: number;
};

const C = CONFIRMATION_CARD.colors;
const F = CONFIRMATION_CARD.fonts;

let logoCache: HTMLImageElement | null | undefined;

function formatBgDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

function drawGoldDivider(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, "rgba(212,168,83,0)");
  grad.addColorStop(0.5, "rgba(212,168,83,0.55)");
  grad.addColorStop(1, "rgba(212,168,83,0)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
}

function drawEyebrowLabel(ctx: CanvasRenderingContext2D, label: string, x: number, y: number) {
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.font = `500 11px ${F.eyebrow}`;
  ctx.fillText(label.toUpperCase(), x, y);
}

function drawFieldValue(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  drawEyebrowLabel(ctx, label, x, y);
  ctx.fillStyle = C.text;
  ctx.font = `600 17px ${F.display}`;
  const lines = wrapText(ctx, value, width);
  lines.forEach((line, i) => ctx.fillText(line, x, y + 22 + i * 22));
  return y + 22 + lines.length * 22 + 16;
}

function loadLogo(): Promise<HTMLImageElement | null> {
  if (logoCache !== undefined) return Promise.resolve(logoCache);

  const tryLoad = (src: string) =>
    new Promise<HTMLImageElement | null>(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  return tryLoad(SITE.logo).then(img => {
    if (img) {
      logoCache = img;
      return img;
    }
    return tryLoad("https://pamporovovilla.com/sites/all/themes/ph/logo.png").then(fallback => {
      logoCache = fallback;
      return fallback;
    });
  });
}

function paintSiteBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#1f1b17");
  bg.addColorStop(1, "#12100e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const glow1 = ctx.createRadialGradient(width * 0.28, height * 0.14, 0, width * 0.28, height * 0.14, width * 0.55);
  glow1.addColorStop(0, "rgba(154, 104, 48, 0.22)");
  glow1.addColorStop(1, "rgba(154, 104, 48, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(width * 0.88, height * 0.9, 0, width * 0.88, height * 0.9, width * 0.4);
  glow2.addColorStop(0, "rgba(212, 168, 83, 0.1)");
  glow2.addColorStop(1, "rgba(212, 168, 83, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);
}

export async function renderConfirmationCardCanvas(data: ConfirmationCardData): Promise<HTMLCanvasElement> {
  await ensureConfirmationCardFonts();
  const logo = await loadLogo();

  const width = 680;
  const height = 940;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const balance = bookingBalanceDue(data.totalAmountEur, data.depositPaidEur) ?? 0;
  const villa = VILLA_LABELS[data.villaId as VillaId] ?? data.villaId;
  const pad = 40;
  const innerPad = 36;
  const contentW = width - pad * 2;

  paintSiteBackground(ctx, width, height);

  roundRect(ctx, pad, pad, contentW, height - pad * 2, 20);
  ctx.fillStyle = C.glassBg;
  ctx.fill();
  ctx.strokeStyle = C.glassBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.strokeStyle = C.glassHighlight;
  ctx.beginPath();
  ctx.moveTo(pad + 20, pad + 1);
  ctx.lineTo(pad + contentW - 20, pad + 1);
  ctx.stroke();

  let y = pad + innerPad;
  ctx.textAlign = "center";

  if (logo) {
    const logoMaxW = 240;
    const logoMaxH = 58;
    const scale = Math.min(logoMaxW / logo.width, logoMaxH / logo.height, 1);
    const lw = logo.width * scale;
    const lh = logo.height * scale;
    ctx.drawImage(logo, (width - lw) / 2, y, lw, lh);
    y += lh + 20;
  }

  drawGoldDivider(ctx, width * 0.225, y, width * 0.55);
  y += 24;

  ctx.fillStyle = C.gold;
  ctx.font = `500 11px ${F.eyebrow}`;
  ctx.letterSpacing = "3.5px";
  ctx.fillText(CONFIRMATION_CARD.copy.eyebrow.toUpperCase(), width / 2, y);
  ctx.letterSpacing = "0px";

  y += 28;
  ctx.fillStyle = C.text;
  ctx.font = `700 32px ${F.display}`;
  ctx.fillText(CONFIRMATION_CARD.copy.title, width / 2, y);

  y += 22;
  ctx.fillStyle = C.textMuted;
  ctx.font = `400 13px ${F.body}`;
  ctx.fillText(`${SITE.tagline} · ${SITE.location}`, width / 2, y);

  y += 36;
  ctx.textAlign = "left";
  const fieldX = pad + innerPad;
  const fieldW = contentW - innerPad * 2;

  y = drawFieldValue(ctx, "Гост", data.guestName, fieldX, y, fieldW);
  y = drawFieldValue(ctx, "Вила", villa, fieldX, y, fieldW);
  y = drawFieldValue(
    ctx,
    "Престой",
    `${formatBgDate(data.checkInDate)}  →  ${formatBgDate(data.checkOutDate)}`,
    fieldX,
    y,
    fieldW
  );
  y = drawFieldValue(
    ctx,
    "Нощувки · гости",
    `${data.nights} нощувки  ·  ${data.numberOfGuests} гости`,
    fieldX,
    y,
    fieldW
  );

  const payY = y + 8;
  const payH = 176;
  roundRect(ctx, fieldX, payY, fieldW, payH, 12);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill();
  ctx.strokeStyle = C.goldSoft;
  ctx.lineWidth = 1;
  ctx.stroke();

  const payRow = (label: string, amount: string, accent: boolean, rowY: number) => {
    ctx.fillStyle = accent ? C.gold : C.textMuted;
    ctx.font = accent ? `500 13px ${F.body}` : `400 13px ${F.body}`;
    ctx.textAlign = "left";
    ctx.fillText(label, fieldX + 20, rowY);
    ctx.textAlign = "right";
    ctx.fillStyle = accent ? C.gold : C.text;
    ctx.font = accent ? `700 22px ${F.display}` : `600 17px ${F.display}`;
    ctx.fillText(amount, fieldX + fieldW - 20, rowY);
    ctx.textAlign = "left";
  };

  payRow("Обща сума", formatAmountEur(data.totalAmountEur), false, payY + 38);
  drawGoldDivider(ctx, fieldX + 16, payY + 52, fieldW - 32);
  payRow("Платено капаро", formatAmountEur(data.depositPaidEur), false, payY + 78);
  drawGoldDivider(ctx, fieldX + 16, payY + 92, fieldW - 32);
  payRow("Остава за плащане", formatAmountEur(balance), true, payY + 132);

  y = payY + payH + 32;
  ctx.textAlign = "center";
  ctx.fillStyle = C.textSoft;
  ctx.font = `400 11px ${F.body}`;
  ctx.fillText(SITE.location, width / 2, y);
  ctx.fillText("Настаняване след 15:00  ·  Напускане до 11:00", width / 2, y + 18);
  ctx.fillText(SITE.email, width / 2, y + 36);

  drawGoldDivider(ctx, width * 0.3, y + 54, width * 0.4);

  ctx.fillStyle = C.gold;
  ctx.font = `500 13px ${F.eyebrow}`;
  ctx.letterSpacing = "2.5px";
  ctx.fillText(SITE.websiteLabel.toUpperCase(), width / 2, y + 78);
  ctx.letterSpacing = "0px";

  return canvas;
}

export async function generateConfirmationCardJpeg(data: ConfirmationCardData): Promise<Blob> {
  const canvas = await renderConfirmationCardCanvas(data);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error("Неуспешно генериране на изображение"))),
      "image/jpeg",
      0.94
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Invalid read result"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) reject(new Error("Invalid base64"));
      else resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(blob);
  });
}

export function confirmationCardMessage(data: ConfirmationCardData): string {
  const balance = bookingBalanceDue(data.totalAmountEur, data.depositPaidEur) ?? 0;
  const villa = VILLA_LABELS[data.villaId as VillaId] ?? data.villaId;
  return [
    `Здравейте, ${data.guestName}!`,
    "",
    "Вашата резервация в Pamporovo Villa е потвърдена.",
    `${villa} · ${formatBgDate(data.checkInDate)} – ${formatBgDate(data.checkOutDate)}`,
    `Общо: ${formatAmountEur(data.totalAmountEur)} · Капаро: ${formatAmountEur(data.depositPaidEur)} · Остава: ${formatAmountEur(balance)}`,
    "",
    SITE.websiteLabel,
  ].join("\n");
}

export { viberChatUrl } from "@shared/messagingLinks";
