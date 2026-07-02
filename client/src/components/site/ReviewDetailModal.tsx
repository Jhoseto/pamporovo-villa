import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { VILLAS } from "@/data/siteContent";
import { cn } from "@/lib/utils";
import type { ReviewItem } from "./ReviewsCarousel";

function villaLabel(villaId: string | null | undefined) {
  if (!villaId) return null;
  return VILLAS.find(v => v.id === villaId)?.name ?? null;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "review-detail-star",
            i < rating ? "review-detail-star--filled" : "review-detail-star--empty"
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

type ReviewDetailModalProps = {
  review: ReviewItem | null;
  onClose: () => void;
};

export function ReviewDetailModal({ review, onClose }: ReviewDetailModalProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!review) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [review, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {review && (
        <motion.div
          className="review-detail-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-detail-title"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        >
          <motion.article
            className="review-detail-card"
            onClick={e => e.stopPropagation()}
            initial={
              reducedMotion ? false : { opacity: 0, scale: 0.9, y: 28, filter: "blur(6px)" }
            }
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.94, y: 16, filter: "blur(4px)" }
            }
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="review-detail-close"
              onClick={onClose}
              aria-label="Затвори"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="review-card-accent" aria-hidden />

            <StarRow rating={review.rating} />

            <blockquote id="review-detail-title" className="review-detail-quote">
              „{review.body}"
            </blockquote>

            <footer className="review-detail-footer">
              <p className="review-card-name">{review.guestName}</p>
              <p className="review-card-meta">
                {[villaLabel(review.villaId), review.stayPeriod].filter(Boolean).join(" · ")}
              </p>
            </footer>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
