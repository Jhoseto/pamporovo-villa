import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminPush } from "@/hooks/useAdminPush";
import { useAdminPwaInstall } from "@/hooks/useAdminPwaInstall";

const DISMISS_KEY = "pamporovo-admin-push-banner-dismissed";

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function AdminPushEnableBanner() {
  const { isSubscribed, subscribe, vapidReady, permission, isBusy } = useAdminPush();
  const { isInstalled, platform } = useAdminPwaInstall();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mobile = isMobileViewport();
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const iosNeedsPwa = platform === "ios" && !isInstalled;

    setShow(
      mobile &&
        !dismissed &&
        vapidReady &&
        !isSubscribed &&
        permission !== "denied" &&
        !iosNeedsPwa
    );
  }, [vapidReady, isSubscribed, permission, isInstalled, platform]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="admin-push-banner fixed inset-x-0 bottom-[calc(9.5rem+env(safe-area-inset-bottom))] z-40 mx-3 lg:hidden">
      <div className="admin-glass-card flex items-start gap-3 border border-[var(--admin-gold-border)] p-4 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-gold-border)] bg-[var(--admin-gold-light)]">
          <Bell className="h-5 w-5 text-[var(--admin-gold)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--admin-fg)]">Включи известията</p>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            Получавай сигнал на телефона при всяка нова резервация от сайта.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="admin-btn-primary h-8"
              onClick={() => subscribe()}
              disabled={isBusy}
            >
              {isBusy ? "Активиране..." : "Разреши известията"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={dismiss}>
              По-късно
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-[var(--admin-muted)] transition hover:text-[var(--admin-fg)]"
          onClick={dismiss}
          aria-label="Затвори"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
