/** Site-aligned tokens for the booking confirmation card (matches index.css). */
export const CONFIRMATION_CARD = {
  colors: {
    ink: "#1a1714",
    inkDeep: "#12100e",
    inkMid: "#221f1b",
    gold: "#d4a853",
    goldDeep: "#9a6830",
    goldSoft: "rgba(212, 168, 83, 0.35)",
    goldGlow: "rgba(212, 168, 83, 0.18)",
    cream: "#f5f2eb",
    text: "rgba(255, 255, 255, 0.94)",
    textMuted: "rgba(255, 255, 255, 0.58)",
    textSoft: "rgba(255, 255, 255, 0.42)",
    glassBg: "rgba(255, 255, 255, 0.06)",
    glassBorder: "rgba(255, 255, 255, 0.12)",
    glassHighlight: "rgba(255, 255, 255, 0.08)",
  },
  fonts: {
    display: '"Playfair Display", Georgia, serif',
    eyebrow: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    body: '"Inter", Arial, Helvetica, sans-serif',
  },
  copy: {
    eyebrow: "Потвърждение",
    title: "Потвърдена резервация",
    subtitle: "3 вили под наем · Пампорово",
  },
} as const;

export async function ensureConfirmationCardFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load('700 32px "Playfair Display"'),
    document.fonts.load('500 12px "Cormorant Garamond"'),
    document.fonts.load('400 14px "Inter"'),
  ]);
}
