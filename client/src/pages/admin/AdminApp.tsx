import { useEffect } from "react";
import { Redirect, Route, Switch } from "wouter";
import { AdminLoadingShell } from "@/components/admin/AdminBootScreen";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminThemeProvider } from "@/contexts/AdminThemeContext";
import { initAdminThemeFromStorage } from "@/hooks/useAdminTheme";
import { applyAdminPwaStandaloneClass, initAdminPwaMeta, registerAdminServiceWorker } from "@/lib/adminPwa";
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
import AdminContactsPage from "./AdminContactsPage";
import AdminContactNewPage from "./AdminContactNewPage";
import AdminContactDetailPage from "./AdminContactDetailPage";

initAdminThemeFromStorage();
initAdminPwaMeta();
void registerAdminServiceWorker();

function useAdminSession() {
  return trpc.admin.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, isError } = useAdminSession();

  return (
    <AdminLoadingShell isLoading={isLoading}>
      {isError ? (
        <AdminConnectionError />
      ) : !me ? (
        <Redirect to="/admin/login" replace />
      ) : (
        <AdminLayout>{children}</AdminLayout>
      )}
    </AdminLoadingShell>
  );
}

function AdminHome() {
  const { data: me, isLoading } = useAdminSession();

  return (
    <AdminLoadingShell isLoading={isLoading}>
      {!me ? (
        <AdminLoginPage />
      ) : (
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )}
    </AdminLoadingShell>
  );
}

function AdminLoginRoute() {
  const { data: me, isLoading } = useAdminSession();

  return (
    <AdminLoadingShell isLoading={isLoading}>
      {me ? <Redirect to="/admin/" replace /> : <AdminLoginPage />}
    </AdminLoadingShell>
  );
}

function AdminConnectionError() {
  return (
    <div className="admin-login flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="text-center text-[var(--admin-muted)]">Неуспешна връзка със сървъра</p>
      <button
        type="button"
        className="admin-btn-primary rounded-xl px-4 py-2 text-sm"
        onClick={() => window.location.reload()}
      >
        Опитай отново
      </button>
    </div>
  );
}

function MasterGuard({ children }: { children: React.ReactNode }) {
  const { data: me } = useAdminSession();

  if (!me?.isMaster) {
    return (
      <div className="admin-glass-card mx-auto max-w-lg p-6 text-center">
        <p className="text-[var(--admin-muted)]">Само главният администратор има достъп до тази страница.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminApp() {
  useEffect(() => {
    document.title = "Административен панел — Pamporovo Villa";

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);

    const cleanupMeta = (() => {
      initAdminPwaMeta();
      return () => undefined;
    })();
    void registerAdminServiceWorker();
    const cleanupStandalone = applyAdminPwaStandaloneClass();

    return () => {
      document.documentElement.classList.remove("admin-mode", "admin-dark", "admin-pwa-standalone");
      meta.remove();
      cleanupMeta();
      cleanupStandalone();
    };
  }, []);

  return (
    <AdminThemeProvider>
      <Switch>
        <Route path="/admin/login" component={AdminLoginRoute} />
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
            <MasterGuard>
              <AdminUsersPage />
            </MasterGuard>
          </AdminGuard>
        </Route>
        <Route path="/admin/contacts/new">
          <AdminGuard>
            <AdminContactNewPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/contacts/:id">
          <AdminGuard>
            <AdminContactDetailPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/contacts">
          <AdminGuard>
            <AdminContactsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/settings">
          <AdminGuard>
            <AdminSettingsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/" component={AdminHome} />
        <Route path="/admin" component={AdminHome} />
      </Switch>
    </AdminThemeProvider>
  );
}

