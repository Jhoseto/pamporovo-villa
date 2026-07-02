import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, Pause, Play, Star } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  REVIEW_BODY_PREVIEW,
  reviewNeedsExpand,
  truncateReviewPreview,
} from "@shared/reviewLimits";
import { VILLAS } from "@/data/siteContent";
import {
  attachContinuousScroll,
  getContinuousScrollSpeed,
  type ContinuousScrollController,
} from "@/lib/emblaContinuousScroll";
import { cn } from "@/lib/utils";
import { ReviewDetailModal } from "./ReviewDetailModal";

export type ReviewItem = {
  id: number;
  guestName: string;
  rating: number;
  body: string;
  villaId: string | null;
  stayPeriod: string | null;
  createdAt: string;
};

function villaLabel(villaId: string | null | undefined) {
  if (!villaId) return null;
  return VILLAS.find(v => v.id === villaId)?.name ?? null;
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const iconClass = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            i < rating ? "fill-[var(--gold)] text-[var(--gold)]" : "text-foreground/15"
          )}
        />
      ))}
    </div>
  );
}

const ReviewCard = memo(function ReviewCard({
  review,
  onExpand,
}: {
  review: ReviewItem;
  onExpand: (review: ReviewItem) => void;
}) {
  const meta = [villaLabel(review.villaId), review.stayPeriod].filter(Boolean).join(" · ");
  const preview = truncateReviewPreview(review.body, REVIEW_BODY_PREVIEW);
  const showExpand = reviewNeedsExpand(review.body, REVIEW_BODY_PREVIEW);

  return (
    <article className="review-card group h-full select-none">
      <div className="review-card-accent" aria-hidden />
      <StarRow rating={review.rating} />
      <blockquote className="review-card-quote">„{preview}"</blockquote>
      <footer className="review-card-footer">
        <div className="min-w-0 flex-1">
          <p className="review-card-name">{review.guestName}</p>
          {meta && <p className="review-card-meta">{meta}</p>}
        </div>
        <button
          type="button"
          className="review-card-expand"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            onExpand(review);
          }}
          aria-label={showExpand ? "Прочети целия отзив" : "Отвори отзива"}
        >
          <Expand className="h-3.5 w-3.5" />
          <span>{showExpand ? "Целият отзив" : "Отвори"}</span>
        </button>
      </footer>
    </article>
  );
});

type ReviewsCarouselProps = {
  reviews: ReviewItem[];
  isLoading?: boolean;
};

export function ReviewsCarousel({ reviews, isLoading }: ReviewsCarouselProps) {
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedReview, setExpandedReview] = useState<ReviewItem | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const pausedRef = useRef(paused);
  const expandedRef = useRef(expandedReview);
  const reducedMotionRef = useRef(prefersReducedMotion);
  const scrollCtrlRef = useRef<ContinuousScrollController | null>(null);
  const hoverPausedRef = useRef(false);

  pausedRef.current = paused;
  expandedRef.current = expandedReview;
  reducedMotionRef.current = prefersReducedMotion;

  const emblaOptions = useMemo(
    () => ({
      loop: true,
      align: "start" as const,
      dragFree: true,
      skipSnaps: false,
      duration: 28,
      watchDrag: () => !expandedRef.current,
    }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  const shouldAutoPlay = useCallback(() => {
    return (
      !pausedRef.current &&
      !hoverPausedRef.current &&
      !expandedRef.current &&
      !reducedMotionRef.current &&
      reviews.length > 1
    );
  }, [reviews.length]);

  const syncAutoPlay = useCallback(() => {
    const ctrl = scrollCtrlRef.current;
    if (!ctrl) return;
    if (shouldAutoPlay()) {
      ctrl.play();
      setIsScrolling(true);
    } else {
      ctrl.stop();
      setIsScrolling(false);
    }
  }, [shouldAutoPlay]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const ctrl = attachContinuousScroll(emblaApi, { speed: getContinuousScrollSpeed() });
    scrollCtrlRef.current = ctrl;

    const onPointerDown = () => {
      setIsDragging(true);
      ctrl.stop();
      setIsScrolling(false);
    };

    const onPointerUp = () => setIsDragging(false);

    const onSettle = () => syncAutoPlay();

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    emblaApi.on("settle", onSettle);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    onSelect();
    syncAutoPlay();

    const mq = window.matchMedia("(max-width: 767px)");
    const onViewportChange = () => ctrl.setSpeed(getContinuousScrollSpeed());
    mq.addEventListener("change", onViewportChange);

    return () => {
      mq.removeEventListener("change", onViewportChange);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      emblaApi.off("settle", onSettle);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      ctrl.destroy();
      scrollCtrlRef.current = null;
    };
  }, [emblaApi, syncAutoPlay]);

  useEffect(() => {
    syncAutoPlay();
  }, [paused, expandedReview, prefersReducedMotion, reviews.length, syncAutoPlay]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        scrollCtrlRef.current?.stop();
        setIsScrolling(false);
      } else {
        syncAutoPlay();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [syncAutoPlay]);

  const scrollPrev = useCallback(() => {
    scrollCtrlRef.current?.stop();
    setIsScrolling(false);
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    scrollCtrlRef.current?.stop();
    setIsScrolling(false);
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleExpand = useCallback((review: ReviewItem) => {
    scrollCtrlRef.current?.stop();
    setIsScrolling(false);
    setExpandedReview(review);
    setPaused(true);
  }, []);

  const handleCloseExpand = useCallback(() => {
    setExpandedReview(null);
    setPaused(false);
  }, []);

  const handleTogglePause = useCallback(() => {
    setPaused(current => {
      const next = !current;
      if (next) {
        scrollCtrlRef.current?.stop();
        setIsScrolling(false);
      } else {
        syncAutoPlay();
      }
      return next;
    });
  }, [syncAutoPlay]);

  if (isLoading) {
    return (
      <div className="reviews-carousel-shell">
        <div className="flex gap-4 overflow-hidden px-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="review-card review-card--skeleton min-h-[220px] min-w-[min(88vw,320px)] shrink-0 md:min-w-[340px]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="reviews-carousel-empty">
        <Star className="mb-3 h-7 w-7 text-[var(--gold)]/45" />
        <p className="font-serif text-lg text-foreground">Все още няма публикувани отзиви</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Бъдете първи — споделете впечатленията си отдолу.
        </p>
      </div>
    );
  }

  const dotCount = Math.min(reviews.length, 12);

  return (
    <>
      <div
        className={cn(
          "reviews-carousel-shell",
          isDragging && "is-dragging",
          isScrolling && "is-scrolling"
        )}
        onMouseEnter={() => {
          hoverPausedRef.current = true;
          scrollCtrlRef.current?.stop();
          setIsScrolling(false);
        }}
        onMouseLeave={() => {
          hoverPausedRef.current = false;
          syncAutoPlay();
        }}
      >
        <div className="reviews-carousel-toolbar">
          <div className="reviews-carousel-status">
            <span className="reviews-carousel-count">
              {String(selectedIndex + 1).padStart(2, "0")}
              <span className="text-foreground/25"> / </span>
              {String(reviews.length).padStart(2, "0")}
            </span>
            {!prefersReducedMotion && reviews.length > 1 && (
              <button
                type="button"
                className="reviews-carousel-play"
                onClick={handleTogglePause}
                aria-label={
                  paused ? "Продължи автоматичното превъртане" : "Пауза на автоматичното превъртане"
                }
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          {reviews.length > 1 && (
            <div className="reviews-carousel-nav">
              <button
                type="button"
                className="reviews-carousel-arrow"
                onClick={scrollPrev}
                aria-label="Предишен отзив"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="reviews-carousel-arrow"
                onClick={scrollNext}
                aria-label="Следващ отзив"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="reviews-carousel-mask">
          <div className="reviews-carousel-viewport" ref={emblaRef}>
            <div className="reviews-carousel-track">
              {reviews.map(review => (
                <div key={review.id} className="reviews-carousel-slide">
                  <ReviewCard review={review} onExpand={handleExpand} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {reviews.length > 1 && (
          <div className="reviews-carousel-dots" role="tablist" aria-label="Отзиви">
            {reviews.slice(0, dotCount).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Отзив ${i + 1}`}
                className={cn("reviews-carousel-dot", i === selectedIndex && "is-active")}
                onClick={() => {
                  scrollCtrlRef.current?.stop();
                  setIsScrolling(false);
                  emblaApi?.scrollTo(i);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ReviewDetailModal review={expandedReview} onClose={handleCloseExpand} />
    </>
  );
}
