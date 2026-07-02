import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { AdminMenuLogo } from "@/components/admin/AdminMenuLogo";
import { AdminPwaInstallBanner } from "@/components/admin/AdminPwaInstallBanner";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = trpc.admin.auth.login.useMutation({
    onSuccess: res => {
      utils.admin.auth.me.setData(undefined, res.user);
      toast.success("Добре дошли!");
      window.location.href = "/admin/";
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="admin-login relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4 z-10">
        <AdminThemeToggle />
      </div>
      <div className="admin-glass-card relative z-[1] w-full max-w-md p-10">
        <AdminMenuLogo className="mx-auto" />
        

        <form
          className="relative mt-8 space-y-4"
          onSubmit={e => {
            e.preventDefault();
            login.mutate({ username: username.trim(), password });
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="admin-input pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="admin-btn-primary w-full" disabled={login.isPending}>
            {login.isPending ? "Влизане..." : "Вход"}
          </Button>
        </form>
        <AdminPwaInstallBanner placement="login" />
      </div>
    </div>
  );
}
