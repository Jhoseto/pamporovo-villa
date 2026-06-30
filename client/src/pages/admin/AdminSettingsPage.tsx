import { useRef, useState } from "react";
import { Download, Music2, Smartphone, Upload, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAdminPush } from "@/hooks/useAdminPush";
import { useAdminPwaInstall } from "@/hooks/useAdminPwaInstall";
import { playNotificationSound } from "@/hooks/useNotificationSound";
import { DEFAULT_NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_MAX_BYTES } from "@shared/notificationSound";

export default function AdminSettingsPage() {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { permission, subscribe, unsubscribe, isSubscribed, vapidReady, isBusy } = useAdminPush();
  const { canInstall, isInstalled, isInstalling, install, showIosInstructions } = useAdminPwaInstall();
  const { data: soundSettings } = trpc.admin.push.getNotificationSound.useQuery();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const uploadSound = trpc.admin.push.uploadNotificationSound.useMutation({
    onSuccess: res => {
      toast.success("Мелодията е запазена");
      utils.admin.push.getNotificationSound.setData(undefined, {
        defaultUrl: soundSettings?.defaultUrl ?? "/admin/sounds/notification-default.wav",
        soundUrl: res.soundUrl,
        hasCustom: true,
      });
    },
    onError: err => toast.error(err.message),
  });

  const resetSound = trpc.admin.push.resetNotificationSound.useMutation({
    onSuccess: res => {
      toast.success("Възстановена е стандартната мелодия");
      utils.admin.push.getNotificationSound.setData(undefined, {
        defaultUrl: soundSettings?.defaultUrl ?? "/admin/sounds/notification-default.wav",
        soundUrl: res.soundUrl,
        hasCustom: false,
      });
    },
    onError: err => toast.error(err.message),
  });

  const handleSoundFile = (file: File) => {
    if (file.size > NOTIFICATION_SOUND_MAX_BYTES) {
      toast.error("Файлът е твърде голям (макс. 512 KB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      uploadSound.mutate({
        fileName: file.name,
        mimeType: file.type || "audio/wav",
        dataBase64: reader.result,
      });
    };
    reader.onerror = () => toast.error("Неуспешно четене на файла");
    reader.readAsDataURL(file);
  };

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

        <div className="mt-6 border-t border-[var(--admin-glass-border-subtle)] pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-glass-border-subtle)] bg-[var(--admin-glass-bg)]">
              <Music2 className="h-5 w-5 text-[var(--admin-muted)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--admin-fg)]">Мелодия за известия</h3>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">
                Премиум chime сигнал (като hotel concierge bell) или собствен звук (WAV, MP3, OGG, до 512 KB).
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm">
            Активна:{" "}
            <strong>{soundSettings?.hasCustom ? "Собствена мелодия" : "Стандартна мелодия"}</strong>
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="admin-glass-btn"
              onClick={() =>
                playNotificationSound(
                  soundSettings?.soundUrl ?? soundSettings?.defaultUrl ?? DEFAULT_NOTIFICATION_SOUND_URL
                )
              }
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Чуй текущата
            </Button>
            <Button
              type="button"
              variant="outline"
              className="admin-glass-btn"
              onClick={() =>
                playNotificationSound(
                  soundSettings?.defaultUrl ?? DEFAULT_NOTIFICATION_SOUND_URL
                )
              }
            >
              Чуй стандартната
            </Button>
            <Button
              type="button"
              className="admin-btn-primary"
              disabled={uploadSound.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadSound.isPending ? "Качване..." : "Качи своя мелодия"}
            </Button>
            {soundSettings?.hasCustom && (
              <Button
                type="button"
                variant="outline"
                className="admin-glass-btn"
                disabled={resetSound.isPending}
                onClick={() => resetSound.mutate()}
              >
                Възстанови стандартната
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/wav,audio/mpeg,audio/ogg,audio/webm,audio/mp4,audio/x-m4a,.wav,.mp3,.ogg,.webm,.m4a"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) handleSoundFile(file);
              event.target.value = "";
            }}
          />

          <p className="mt-3 text-xs text-[var(--admin-muted)]">
            Звукът се пуска, когато админ панелът е отворен. На iPhone системният звук на известието може да
            остане стандартен.
          </p>
        </div>
      </section>

      <section className="admin-glass-card p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-glass-border-subtle)] bg-[var(--admin-glass-bg)]">
            <Smartphone className="h-5 w-5 text-[var(--admin-muted)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold">Приложение на телефона (PWA)</h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              Инсталирайте админ панела като приложение на началния екран за бърз достъп и известия.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            Статус:{" "}
            <strong>{isInstalled ? "Инсталирано" : canInstall ? "Готово за инсталация" : "Не е инсталирано"}</strong>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {canInstall && !isInstalled && (
            <Button className="admin-btn-primary" onClick={() => install()} disabled={isInstalling}>
              <Download className="mr-2 h-4 w-4" />
              {isInstalling ? "Инсталиране..." : "Инсталирай приложението"}
            </Button>
          )}
          {isInstalled && (
            <p className="text-sm text-[var(--admin-muted)]">
              Отворете админ панела от иконата на началния екран.
            </p>
          )}
        </div>

        {showIosInstructions && (
          <div className="mt-4 rounded-xl border border-[var(--admin-glass-border-subtle)] bg-[var(--admin-glass-bg)] p-4 text-sm text-[var(--admin-muted)]">
            <p className="font-medium text-[var(--admin-fg)]">iPhone / iPad (Safari)</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Натиснете бутона „Сподели“ (квадрат със стрелка нагоре)</li>
              <li>Изберете „Добави на началния екран“</li>
              <li>Отворете иконата и активирайте известията от тази страница</li>
            </ol>
          </div>
        )}

        {!isInstalled && !canInstall && !showIosInstructions && (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--admin-glass-border-subtle)] p-4 text-sm text-[var(--admin-muted)]">
            <p>
              <strong>Android:</strong> Chrome → Меню (⋮) → „Инсталирай приложението“ или „Добави на началния екран“
            </p>
            <p className="mt-2">
              <strong>Desktop:</strong> иконата за инсталация в адресната лента на Chrome/Edge
            </p>
          </div>
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
    </div>
  );
}
