import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAdminPush } from "@/hooks/useAdminPush";

export default function AdminSettingsPage() {
  const utils = trpc.useUtils();
  const { permission, subscribe, unsubscribe, isSubscribed, vapidReady, isBusy } = useAdminPush();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const logout = trpc.admin.auth.logout.useMutation({
    onSuccess: () => {
      utils.admin.auth.me.setData(undefined, null);
      window.location.href = "/admin/login";
    },
  });

  const changePassword = trpc.admin.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Паролата е сменена — моля, влезте отново");
      setCurrentPassword("");
      setNewPassword("");
      logout.mutate();
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="admin-page-header">
        <h1>Настройки</h1>
        <p>Известия и профил</p>
      </div>

      <section className="admin-glass-card p-6">
        <h2 className="font-serif text-xl font-semibold">Натисни известия</h2>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">
          На телефон: Safari → Сподели → Добави на началния екран, след което разрешете известията тук.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p>
            Статус:{" "}
            <strong>
              {permission === "granted" && isSubscribed
                ? "Активни"
                : permission === "denied"
                  ? "Блокирани в браузъра"
                  : "Неактивни"}
            </strong>
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            className="admin-btn-primary"
            onClick={() => subscribe()}
            disabled={!vapidReady || isBusy || permission === "denied"}
          >
            {isSubscribed ? "Обнови абонамента" : "Активирай известията"}
          </Button>
          {isSubscribed && (
            <Button variant="outline" className="admin-glass-btn" onClick={() => unsubscribe()} disabled={isBusy}>
              Деактивирай известията
            </Button>
          )}
        </div>
        {permission === "denied" && (
          <p className="mt-3 text-sm text-[var(--admin-muted)]">
            Разрешете известията от настройките на браузъра за този сайт.
          </p>
        )}
      </section>

      <section className="admin-glass-card p-6">
        <h2 className="font-serif text-xl font-semibold">Смяна на парола</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Текуща парола</Label>
            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="admin-input" />
          </div>
          <div className="space-y-2">
            <Label>Нова парола</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="admin-input" />
          </div>
          <Button
            variant="outline"
            className="admin-glass-btn"
            onClick={() => changePassword.mutate({ currentPassword, newPassword })}
            disabled={changePassword.isPending}
          >
            Смени паролата
          </Button>
        </div>
      </section>

      <section className="admin-glass-card admin-glass-card--dashed p-6 text-sm text-[var(--admin-muted)]">
        <h3 className="font-semibold text-[var(--admin-fg)]">Инсталирай на телефона (PWA)</h3>
        <p className="mt-2">
          <strong>Android:</strong> Chrome → Меню → Инсталирай приложението / Добави на началния екран
        </p>
        <p className="mt-1">
          <strong>iPhone:</strong> Safari → Сподели → Добави на началния екран → отворете иконата → активирайте известията
        </p>
      </section>
    </div>
  );
}
