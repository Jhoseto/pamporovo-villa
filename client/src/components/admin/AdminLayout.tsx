import { Link, useLocation } from "wouter";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Календар", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Заявки", icon: ClipboardList },
  { href: "/admin/bookings/new", label: "Нова резервация", icon: PlusCircle },
  { href: "/admin/pricing", label: "Цени", icon: Wallet },
  { href: "/admin/offers", label: "Оферти", icon: Tag },
  { href: "/admin/users", label: "Потребители", icon: Users, masterOnly: true },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { data: me } = trpc.admin.auth.me.useQuery(undefined, { retry: false });
  const { data: stats } = trpc.admin.bookings.stats.useQuery(undefined, {
    enabled: !!me,
    refetchInterval: 60_000,
  });
  const logout = trpc.admin.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/admin/login";
    },
  });

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map(item => {
        if (item.masterOnly && !me?.isMaster) return null;
        const active = item.exact ? location === item.href : location.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <a
              onClick={onNavigate}
              className={cn(
                "admin-nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active && "admin-nav-link--active"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/bookings" && stats && stats.pending > 0 && (
                <span className="admin-badge">{stats.pending}</span>
              )}
            </a>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-shell flex min-h-screen">
      <aside className="admin-sidebar hidden lg:flex lg:flex-col">
        <div className="admin-sidebar-brand px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            Pamporovo Villa
          </p>
          <h1 className="font-serif text-2xl font-bold text-[var(--admin-fg)]">Admin</h1>
        </div>
        <div className="flex-1 px-3">
          <NavLinks />
        </div>
        <div className="border-t border-[var(--admin-border)] p-4">
          <p className="mb-2 truncate text-sm font-medium text-[var(--admin-fg)]">{me?.username}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Изход
          </Button>
        </div>
      </aside>

      <div className="admin-main flex min-h-screen flex-1 flex-col">
        <header className="admin-topbar sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="admin-sheet w-[280px] p-0">
                <div className="border-b border-[var(--admin-border)] px-5 py-6">
                  <p className="font-serif text-xl font-bold">Admin Panel</p>
                </div>
                <div className="p-3">
                  <NavLinks onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <div className="lg:hidden">
              <p className="font-serif text-lg font-bold">Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
            <AdminThemeToggle />
            <CalendarDays className="hidden h-4 w-4 sm:block" />
            <span className="hidden sm:inline">{me?.username}</span>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-2 lg:px-8 lg:pb-8">{children}</main>

        <nav className="admin-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-2 lg:hidden">
          {navItems.slice(0, 4).map(item => {
            const active = item.exact ? location === item.href : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium",
                    active ? "text-[var(--admin-accent)]" : "text-[var(--admin-muted)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label.split(" ")[0]}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
