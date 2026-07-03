import { trackEvent, trackPageView } from "./gtag";

export function trackPhoneClick(source: string) {
  trackEvent("phone_click", { source });
}

export function trackBookingSubmit(villaId: string) {
  trackEvent("generate_lead", { form_type: "booking", villa_id: villaId });
}

export function trackReviewSubmit() {
  trackEvent("review_submit", { form_type: "review" });
}

export function trackOfferOpen() {
  trackEvent("offer_open");
}

export function trackContactClick(type: "phone" | "email" | "google_maps" | "google_review") {
  trackEvent("contact_click", { contact_type: type });
}

export function trackGoogleReviewClick(source: string) {
  trackEvent("google_review_click", { source });
}

const AI_REFERRER_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "claude.ai",
  "you.com",
];

export function detectAiReferrer(): string | null {
  if (typeof document === "undefined") return null;
  const ref = document.referrer;
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    const match = AI_REFERRER_HOSTS.find((h) => host === h || host.endsWith(`.${h}`));
    return match ?? null;
  } catch {
    return null;
  }
}

export function trackAiReferralOnce() {
  const source = detectAiReferrer();
  if (!source) return;
  const key = `ai_ref_${source}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  trackEvent("ai_referral", { source, page_path: window.location.pathname });
}

export function getTrafficSegment(pathname: string): "home" | "guide" | "transactional" {
  if (pathname === "/rent" || pathname.startsWith("/villa/")) return "transactional";
  if (pathname === "/pamporovo" || pathname.startsWith("/pamporovo/")) return "guide";
  return "home";
}

export function trackPublicPageView(pathname: string, search = "") {
  const full = `${pathname}${search}`;
  trackPageView(full);
  trackEvent("traffic_segment_view", {
    traffic_segment: getTrafficSegment(pathname),
    page_path: pathname,
  });
}

export function trackRentPageView(lang: string) {
  trackEvent("rent_page_view", { page_lang: lang });
}

export function trackBookStart(source: string) {
  trackEvent("book_start", { source });
}
