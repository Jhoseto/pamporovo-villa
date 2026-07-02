import { useConsent } from "@/contexts/ConsentContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CONSENT_NECESSARY_ONLY } from "@/lib/consent/types";
import { MapPin, Shield, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function CategoryRow({
  icon: Icon,
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-[oklch(0_0_0/0.06)] bg-[oklch(1_0_0/0.6)] p-4">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/10">
          <Icon className="h-4 w-4 text-[var(--gold)]" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-wide text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function CookieSettingsModal() {
  const { consent, settingsOpen, closeSettings, savePreferences, acceptAll, rejectAll } =
    useConsent();
  const current = consent ?? CONSENT_NECESSARY_ONLY;
  const [analytics, setAnalytics] = useState(current.analytics);
  const [functional, setFunctional] = useState(current.functional);

  useEffect(() => {
    if (settingsOpen) {
      setAnalytics(current.analytics);
      setFunctional(current.functional);
    }
  }, [settingsOpen, current.analytics, current.functional]);

  return (
    <Dialog open={settingsOpen} onOpenChange={open => !open && closeSettings()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[oklch(0_0_0/0.08)] bg-[var(--cream)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Настройки за бисквитки</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Изберете кои категории да разрешите. Необходимите бисквитки винаги са активни.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <CategoryRow
            icon={Shield}
            title="Необходими"
            description="Запазват избора ви за бисквитки и осигуряват основната работа на сайта."
            checked
            disabled
          />
          <CategoryRow
            icon={BarChart3}
            title="Аналитични"
            description="Google Analytics 4 — анонимна статистика за посещения и поведение на сайта."
            checked={analytics}
            onCheckedChange={setAnalytics}
          />
          <CategoryRow
            icon={MapPin}
            title="Функционални / трети страни"
            description="Google Maps — интерактивна карта с локацията на вилите."
            checked={functional}
            onCheckedChange={setFunctional}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-full border border-[oklch(0_0_0/0.1)] px-5 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-[oklch(0_0_0/0.04)]"
          >
            Само необходими
          </button>
          <button
            type="button"
            onClick={() => savePreferences(analytics, functional)}
            className="premium-btn rounded-full px-5 py-2.5 text-sm"
          >
            Запази избора
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Приемам всички
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CookieConsent() {
  const [, setLocation] = useLocation();
  const { showBanner, acceptAll, openSettings } = useConsent();

  if (!showBanner) {
    return <CookieSettingsModal />;
  }

  return (
    <>
      <div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
        className="fixed inset-x-0 bottom-0 z-[200] border-t border-[oklch(0_0_0/0.08)] bg-[var(--cream)]/95 p-4 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md md:p-6"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="max-w-2xl">
            <p id="cookie-banner-title" className="font-serif text-lg font-semibold text-foreground">
              Бисквитки и поверителност
            </p>
            <p id="cookie-banner-desc" className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Използваме необходими бисквитки за работа на сайта. С ваше съгласие активираме Google
              Analytics и Google Maps.{" "}
              <button
                type="button"
                onClick={() => setLocation("/legal?tab=cookies")}
                className="underline decoration-[var(--gold)] underline-offset-2 hover:text-[var(--gold)]"
              >
                Политика за бисквитки
              </button>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0">
            <button
              type="button"
              onClick={openSettings}
              className="rounded-full border border-[oklch(0_0_0/0.1)] px-5 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-[oklch(0_0_0/0.04)]"
            >
              Настройки
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Приемам
            </button>
          </div>
        </div>
      </div>
      <CookieSettingsModal />
    </>
  );
}

export function CookieSettingsTrigger() {
  const { openSettings } = useConsent();

  return (
    <button
      type="button"
      onClick={openSettings}
      className="text-xs text-white/35 transition hover:text-[var(--gold)]"
    >
      Управление на бисквитки
    </button>
  );
}
