import { cn } from "@/lib/utils";

export function ContactVipBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200",
        className
      )}
    >
      VIP
    </span>
  );
}

export function GuestNameWithVip({
  name,
  isVip,
  className,
}: {
  name: string;
  isVip?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      <span>{name}</span>
      {isVip ? <ContactVipBadge /> : null}
    </span>
  );
}
