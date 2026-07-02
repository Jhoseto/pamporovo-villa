import { Link, useLocation } from "wouter";
import {
  CalendarDays,
  ClipboardList,
  ContactRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PlusCircle,
  Settings,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AdminMenuLogo } from "@/components/admin/AdminMenuLogo";
import { AdminPwaInstallBanner } from "@/components/admin/AdminPwaInstallBanner";
import { AdminPushEnableBanner } from "@/components/admin/AdminPushEnableBanner";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { adminRoleLabel } from "@/lib/adminLabels";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useNotificationSoundListener } from "@/hooks/useNotificationSound";

const navItems = [
  { href: "/admin/", label: "Календар", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Резервации", icon: ClipboardList },
  { href: "/admin/contacts", label: "Контакти", icon: ContactRound },
  { href: "/admin/bookings/new", label: "Нова резервация", icon: PlusCircle },
  { href: "/admin/pricing", label: "Цени", icon: Wallet },
  { href: "/admin/offers", label: "Оферти", icon: Tag },
  { href: "/admin/users", label: "Администратори", icon: Users, masterOnly: true },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

function userInitials(username?: string) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}

function isNavActive(location: string, href: string, exact?: boolean) {
  const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  if (href === "/admin/bookings") return norm(location) === "/admin/bookings";
  if (href === "/admin/contacts") return norm(location) === "/admin/contacts";
  if (exact) return norm(location) === norm(href);
  return location.startsWith(href);
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  useNotificationSoundListener();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: me } = trpc.admin.auth.me.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.bookings.stats.useQuery(undefined, {
    enabled: !!me,
    refetchInterval: 60_000,
  });
  const logout = trpc.admin.auth.logout.useMutation({
    onSuccess: () => {
      utils.admin.auth.me.setData(undefined, null);
      window.location.href = "/admin/login";
    },
  });

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map(item => {
        if (item.masterOnly && !me?.isMaster) return null;
        const active = isNavActive(location, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "admin-nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active && "admin-nav-link--active"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/bookings" && stats && stats.pending > 0 && (
              <span className="admin-badge">{stats.pending}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const bottomNavItems = navItems.slice(0, 3);
  const moreNavItems = navItems.slice(3).filter(item => !item.masterOnly || me?.isMaster);
  const moreNavActive = moreNavItems.some(item => isNavActive(location, item.href, item.exact));

  return (
    <div className="admin-shell flex min-h-screen">
      <aside className="admin-sidebar hidden lg:flex lg:flex-col">
        <div className="admin-sidebar-brand px-5 py-7 pb-6">
          <AdminMenuLogo />
        </div>
        <div className="flex-1 px-3">
          <NavLinks />
        </div>
        <div className="admin-sidebar-footer p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="admin-user-avatar">{userInitials(me?.username)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--admin-fg)]">{me?.username}</p>
              <p className="text-xs text-[var(--admin-muted)]">{adminRoleLabel(!!me?.isMaster)}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="admin-glass-btn w-full"
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
                <Button variant="outline" size="icon" className="admin-glass-btn lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="admin-sheet w-[300px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin навигация</SheetTitle>
                  <SheetDescription>Меню с раздели на admin панела</SheetDescription>
                </SheetHeader>
                <div className="admin-sheet-divider border-b px-5 py-7">
                  <AdminMenuLogo />
                </div>
                <div className="p-3">
                  <NavLinks onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <div className="lg:hidden">
              <AdminMenuLogo compact showSubtitle={false} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AdminThemeToggle />
            <div className="admin-user-pill hidden sm:flex">
              <CalendarDays className="h-3.5 w-3.5 opacity-60" />
              <span>{me?.username}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-6">{children}</main>

        <nav className="admin-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 p-2 lg:hidden">
          {bottomNavItems.map(item => {
            const active = isNavActive(location, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium text-[var(--admin-muted)] transition-colors",
                  active && "admin-bottom-nav-link--active"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium text-[var(--admin-muted)] transition-colors",
                  moreNavActive && "admin-bottom-nav-link--active"
                )}
              >
                <MoreHorizontal className="h-5 w-5 shrink-0" />
                Още
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="admin-sheet rounded-t-2xl p-4">
              <SheetHeader className="mb-3 p-0">
                <SheetTitle className="text-sm font-semibold text-[var(--admin-fg)]">Още секции</SheetTitle>
                <SheetDescription className="sr-only">Допълнителни admin раздели</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2">
                {moreNavItems.map(item => {
                  const active = isNavActive(location, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "admin-nav-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                        active && "admin-nav-link--active"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </nav>
        <AdminPwaInstallBanner />
        <AdminPushEnableBanner />
      </div>
    </div>
  );
}
