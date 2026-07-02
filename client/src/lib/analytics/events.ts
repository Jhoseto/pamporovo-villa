import { trackEvent } from "./gtag";

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

export function trackContactClick(type: "phone" | "email") {
  trackEvent("contact_click", { contact_type: type });
}
