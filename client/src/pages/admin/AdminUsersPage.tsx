import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { data: users = [], refetch } = trpc.admin.users.list.useQuery();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const create = trpc.admin.users.create.useMutation({
    onSuccess: () => {
      toast.success("Потребителят е създаден");
      setUsername("");
      setPassword("");
      refetch();
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Изтрит");
      refetch();
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Потребители</h1>
        <p className="text-[var(--admin-muted)]">Само master admin може да управлява профили</p>
      </div>

      <div className="divide-y divide-[var(--admin-border)] overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)]">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{u.username}</p>
              <p className="text-xs text-[var(--admin-muted)]">{u.isMaster ? "Master" : "Admin"}</p>
            </div>
            {!u.isMaster && (
              <Button variant="destructive" size="sm" onClick={() => remove.mutate({ id: u.id })}>
                Изтрий
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-6">
        <h3 className="font-serif text-xl font-bold">Нов потребител</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Потребител</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} className="admin-input" />
          </div>
          <div className="space-y-2">
            <Label>Парола (6+ символа, 2+ цифри)</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" />
          </div>
          <Button className="admin-btn-primary" onClick={() => create.mutate({ username, password })}>
            Създай
          </Button>
        </div>
      </div>
    </div>
  );
}
