import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminThemeContext } from "@/contexts/AdminThemeContext";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function AdminThemeToggle({ className }: Props) {
  const { theme, toggleTheme } = useAdminThemeContext();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("admin-glass-btn", className)}
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Тъмен режим" : "Светъл режим"}
      title={theme === "light" ? "Тъмен режим" : "Светъл режим"}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
