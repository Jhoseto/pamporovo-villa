import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminRoleLabel } from "@/lib/adminLabels";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const utils = trpc.useUtils();
  const { data: users = [], isLoading, isError } = trpc.admin.users.list.useQuery();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const create = trpc.admin.users.create.useMutation({
    onSuccess: () => {
      toast.success("Потребителят е създаден");
      setUsername("");
      setPassword("");
      utils.admin.users.list.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Изтрит");
      utils.admin.users.list.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const reset = trpc.admin.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Паролата е сменена");
      setResetUserId(null);
      setResetPassword("");
      utils.admin.users.list.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="admin-page-header">
        <h1>Администратори</h1>
        <p>Само главният администратор може да управлява профили</p>
      </div>

      <div className="admin-glass-card divide-y divide-[var(--admin-glass-border-subtle)] overflow-hidden">
        {isLoading ? (
          <div className="admin-skeleton h-24" />
        ) : isError ? (
          <p className="p-6 text-center text-[var(--admin-muted)]">Грешка при зареждане на потребителите</p>
        ) : (
          users.map(u => (
            <div key={u.id} className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{u.username}</p>
                  <p className="text-xs text-[var(--admin-muted)]">{adminRoleLabel(u.isMaster)}</p>
                </div>
                {!u.isMaster && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="admin-glass-btn"
                      onClick={() => {
                        setResetUserId(resetUserId === u.id ? null : u.id);
                        setResetPassword("");
                      }}
                    >
                      Нова парола
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => remove.mutate({ id: u.id })}
                      disabled={remove.isPending}
                    >
                      Изтрий
                    </Button>
                  </div>
                )}
              </div>
              {resetUserId === u.id && (
                <div className="rounded-xl border border-[var(--admin-glass-border-subtle)] bg-[var(--admin-glass)] p-4">
                  <Label htmlFor={`reset-${u.id}`}>Нова парола (6+ символа, 2+ цифри)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Input
                      id={`reset-${u.id}`}
                      type="password"
                      value={resetPassword}
                      onChange={e => setResetPassword(e.target.value)}
                      className="admin-input max-w-xs"
                    />
                    <Button
                      className="admin-btn-primary"
                      size="sm"
                      onClick={() => reset.mutate({ id: u.id, newPassword: resetPassword })}
                      disabled={reset.isPending || resetPassword.length < 6}
                    >
                      Запази паролата
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="admin-glass-card p-6">
        <h3 className="font-serif text-xl font-semibold">Нов потребител</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-username">Потребител</Label>
            <Input
              id="new-username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Парола (6+ символа, 2+ цифри)</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="admin-input"
            />
          </div>
          <Button
            className="admin-btn-primary"
            onClick={() => create.mutate({ username, password })}
            disabled={create.isPending}
          >
            Създай
          </Button>
        </div>
      </div>
    </div>
  );
}
