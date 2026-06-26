import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PremiumFormFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export function PremiumFormField({ label, htmlFor, children, className }: PremiumFormFieldProps) {
  return (
    <div className={cn("premium-field", className)}>
      <Label htmlFor={htmlFor} className="premium-label">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function PremiumFormCard({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("premium-form-card p-8 md:p-10 lg:p-12", className)}>
      {title && (
        <>
          <h3 className="premium-form-heading">{title}</h3>
          <div className="premium-form-divider my-6" />
        </>
      )}
      {children}
    </div>
  );
}
