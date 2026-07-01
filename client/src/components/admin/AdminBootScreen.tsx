import { AdminSplashScreen, useAdminSplashGate } from "@/components/admin/AdminSplashScreen";

export function AdminBootScreen() {
  return <AdminSplashScreen />;
}

export function AdminLoadingShell({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  const { showSplash, exiting } = useAdminSplashGate(isLoading);

  if (showSplash) {
    return <AdminSplashScreen exiting={exiting} />;
  }

  return <>{children}</>;
}
