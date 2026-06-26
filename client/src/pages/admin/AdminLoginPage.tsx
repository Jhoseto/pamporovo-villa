import { useState } from "react";
import { useLocation } from "wouter";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.admin.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Добре дошли!");
      setLocation("/admin");
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="admin-login relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <AdminThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
          Pamporovo Villa
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--admin-fg)]">Admin вход</h1>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">Управление на резервации и цени</p>

        <form
          className="mt-8 space-y-4"
          onSubmit={e => {
            e.preventDefault();
            login.mutate({ username, password });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="username">Потребител</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              className="admin-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Парола</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="admin-input"
            />
          </div>
          <Button type="submit" className="admin-btn-primary w-full" disabled={login.isPending}>
            {login.isPending ? "Влизане..." : "Вход"}
          </Button>
        </form>
      </div>
    </div>
  );
}
