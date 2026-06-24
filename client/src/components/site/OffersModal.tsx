import { motion } from "framer-motion";
import { Check, Sparkles, Tag } from "lucide-react";
import { OFFERS } from "@/data/siteContent";
import { scrollToSection } from "@/lib/scroll";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { MagneticButton } from "./MagneticButton";

type OffersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OffersModal({ open, onOpenChange }: OffersModalProps) {
  const handleBooking = () => {
    onOpenChange(false);
    scrollToSection("booking");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[92vh] max-w-5xl overflow-y-auto border border-[var(--gold)]/30 bg-[var(--ink)] p-0 text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)] sm:max-w-5xl [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]]:hover:text-white"
      >
        <div className="relative overflow-hidden px-6 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.55_0.15_50/0.22),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,oklch(0.45_0.08_280/0.15),transparent_50%)]" />
          <div className="film-grain pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative">
            <p className="eyebrow mb-3 inline-flex items-center gap-2 text-[var(--gold)]">
              <Sparkles className="h-3.5 w-3.5" />
              Ексклузивни пакети
            </p>
            <DialogTitle className="font-serif text-3xl font-bold tracking-tight text-white md:text-4xl">
              Топ оферти
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-2xl text-base text-white/70">
              Специални пакети за семейна ски и лятна почивка в Pamporovo Villa — ограничени
              периоди и отлична стойност.
            </DialogDescription>
          </div>

          <div className="relative mt-8 grid gap-6 md:grid-cols-2">
            {OFFERS.map((offer, idx) => (
              <motion.article
                key={offer.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-[var(--gold)]/35 md:p-7"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="mb-4 flex items-start justify-between gap-3">
                  <p className="eyebrow text-[var(--gold)]">{offer.period}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
                    <Tag className="h-3 w-3" />
                    Оферта
                  </span>
                </div>

                <h3 className="mb-4 font-serif text-xl font-bold leading-snug text-white md:text-2xl">
                  {offer.title}
                </h3>

                <div className="mb-4 flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-bold text-[var(--gold)] md:text-4xl">
                    {offer.price}
                  </span>
                  <span className="text-base text-white/35 line-through">{offer.oldPrice}</span>
                </div>

                <p className="mb-6 flex-1 text-sm leading-relaxed text-white/75 md:text-[15px]">
                  {offer.description}
                </p>

                <ul className="mb-7 space-y-2.5">
                  {offer.includes.map(item => (
                    <li key={item} className="flex gap-2.5 text-sm text-white/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <MagneticButton className="premium-btn w-full" onClick={handleBooking}>
                  Възползвай се
                </MagneticButton>
              </motion.article>
            ))}
          </div>

          <p className="relative mt-6 text-center text-xs text-white/45">
            Офертите са валидни за посочените периоди · за резервация — секция „Резервирай“
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
