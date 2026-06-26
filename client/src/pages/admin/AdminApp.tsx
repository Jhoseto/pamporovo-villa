import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminThemeProvider } from "@/contexts/AdminThemeContext";
import { initAdminThemeFromStorage } from "@/hooks/useAdminTheme";
import { trpc } from "@/lib/trpc";
import AdminLoginPage from "./AdminLoginPage";
import AdminDashboardPage from "./AdminDashboardPage";
import AdminBookingsPage from "./AdminBookingsPage";
import AdminBookingNewPage from "./AdminBookingNewPage";
import AdminBookingDetailPage from "./AdminBookingDetailPage";
import AdminPricingPage from "./AdminPricingPage";
import AdminOffersPage from "./AdminOffersPage";
import AdminUsersPage from "./AdminUsersPage";
import AdminSettingsPage from "./AdminSettingsPage";

initAdminThemeFromStorage();

function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: me, isLoading, isError } = trpc.admin.auth.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && (isError || !me)) {
      setLocation("/admin/login");
    }
  }, [isLoading, isError, me, setLocation]);

  if (isLoading) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center">
        <div className="admin-skeleton h-12 w-48 rounded-xl" />
      </div>
    );
  }

  if (!me) return null;

  return <AdminLayout>{children}</AdminLayout>;
}

export default function AdminApp() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);

    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/admin/manifest.webmanifest";
    document.head.appendChild(manifest);

    const apple = document.createElement("meta");
    apple.name = "apple-mobile-web-app-capable";
    apple.content = "yes";
    document.head.appendChild(apple);

    return () => {
      document.documentElement.classList.remove("admin-mode", "admin-dark");
    };
  }, []);

  return (
    <AdminThemeProvider>
      <Switch>
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/bookings/new">
        <AdminGuard>
          <AdminBookingNewPage />
        </AdminGuard>
      </Route>
      <Route path="/admin/bookings/:id">
        <AdminGuard>
          <AdminBookingDetailPage />
        </AdminGuard>
      </Route>
      <Route path="/admin/bookings">
        <AdminGuard>
          <AdminBookingsPage />
        </AdminGuard>
      </Route>
      <Route path="/admin/pricing">
        <AdminGuard>
          <AdminPricingPage />
        </AdminGuard>
      </Route>
      <Route path="/admin/offers">
        <AdminGuard>
          <AdminOffersPage />
        </AdminGuard>
      </Route>
      <Route path="/admin/users">
        <AdminGuard>
          <AdminUsersPage />
        </AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard>
          <AdminSettingsPage />
        </AdminGuard>
      </Route>
      <Route path="/admin">
        <AdminGuard>
          <AdminDashboardPage />
        </AdminGuard>
      </Route>
    </Switch>
    </AdminThemeProvider>
  );
}
