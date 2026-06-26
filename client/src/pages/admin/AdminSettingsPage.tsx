import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAdminPush } from "@/hooks/useAdminPush";

export default function AdminSettingsPage() {
  const { permission, subscribe, isSubscribed, vapidReady } = useAdminPush();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const changePassword = trpc.admin.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Паролата е сменена");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Настройки</h1>
        <p className="text-[var(--admin-muted)]">Push нотификации и профил</p>
      </div>

      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-6">
        <h2 className="font-serif text-xl font-bold">Push нотификации</h2>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">
          На телефон: Safari → Share → Add to Home Screen, после разрешете нотификации тук.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p>
            Статус:{" "}
            <strong>
              {permission === "granted" && isSubscribed
                ? "Активни"
                : permission === "denied"
                  ? "Блокирани"
                  : "Неактивни"}
            </strong>
          </p>
        </div>
        <Button className="admin-btn-primary mt-4" onClick={() => subscribe()} disabled={!vapidReady}>
          {isSubscribed ? "Обнови абонамент" : "Активирай push"}
        </Button>
      </section>

      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-6">
        <h2 className="font-serif text-xl font-bold">Смяна на парола</h2>
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
            onClick={() => changePassword.mutate({ currentPassword, newPassword })}
            disabled={changePassword.isPending}
          >
            Смени паролата
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--admin-border)] p-6 text-sm text-[var(--admin-muted)]">
        <h3 className="font-semibold text-[var(--admin-fg)]">Инсталирай на телефона (PWA)</h3>
        <p className="mt-2">
          <strong>Android:</strong> Chrome menu → Install app / Add to Home screen
        </p>
        <p className="mt-1">
          <strong>iPhone:</strong> Safari → Share → Add to Home Screen → отворете иконата → активирайте push
        </p>
      </section>
    </div>
  );
}
