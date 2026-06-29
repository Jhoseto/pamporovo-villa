import { SITE } from "@/data/siteContent";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  showSubtitle?: boolean;
  className?: string;
};

export function AdminMenuLogo({ compact = false, showSubtitle = true, className }: Props) {
  return (
    <div className={cn("admin-menu-brand", compact && "admin-menu-brand--compact", className)}>
      <div className={cn("admin-menu-logo-wrap", compact && "admin-menu-logo-wrap--compact")}>
        <img src={SITE.logo} alt="Pamporovo Villa" className="admin-menu-logo" />
      </div>
      {showSubtitle && (
        <p className={cn("admin-menu-subtitle", compact && "admin-menu-subtitle--compact")}>
          Административен панел
        </p>
      )}
    </div>
  );
}
