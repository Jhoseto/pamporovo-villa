import { Download, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminPwaInstall } from "@/hooks/useAdminPwaInstall";

export function AdminPwaInstallBanner({ placement = "app" }: { placement?: "app" | "login" }) {
  const {
    canInstall,
    isInstalling,
    install,
    showBanner,
    dismissBanner,
    showIosInstructions,
    showInstallButton,
    installButtonEnabled,
    installButtonLabel,
  } = useAdminPwaInstall();

  if (!showBanner) return null;

  const positionClass =
    placement === "login"
      ? "bottom-[max(1rem,env(safe-area-inset-bottom))]"
      : "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]";

  return (
    <div className={`admin-pwa-banner fixed inset-x-0 ${positionClass} z-40 mx-3 lg:hidden`}>
      <div className="admin-glass-card flex items-start gap-3 p-4 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-glass-border-subtle)] bg-[var(--admin-panel-solid)]">
          <Smartphone className="h-5 w-5 text-[var(--admin-muted)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--admin-fg)]">Инсталирай като приложение</p>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            {showIosInstructions
              ? "Safari → Сподели → Добави на началния екран (пълен екран)."
              : "Пълен екран без адресна лента — като истинско мобилно приложение."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {showInstallButton ? (
              <Button
                size="sm"
                className="admin-btn-primary h-8"
                onClick={() => install()}
                disabled={!installButtonEnabled}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {installButtonLabel}
              </Button>
            ) : showIosInstructions ? (
              <div className="flex items-center gap-1.5 text-xs text-[var(--admin-muted)]">
                <Share className="h-3.5 w-3.5 shrink-0" />
                <span>Safari → Сподели → Добави на началния екран</span>
              </div>
            ) : null}
            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={dismissBanner}>
              По-късно
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-[var(--admin-muted)] transition hover:text-[var(--admin-fg)]"
          onClick={dismissBanner}
          aria-label="Затвори"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
