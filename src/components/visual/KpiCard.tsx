import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "hero" | "warn";
  footer?: React.ReactNode;
  className?: string;
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "default",
  footer,
  className,
}: KpiCardProps) {
  const isHero = variant === "hero";
  const isWarn = variant === "warn";

  return (
    <div
      className={cn(
        "rounded-2xl p-3 transition",
        isHero
          ? "bg-ink text-white"
          : isWarn
            ? "border border-line bg-surface-2"
            : "border border-line bg-surface",
        className,
      )}
    >
      <div
        className={cn(
          "mb-2 flex items-center gap-1.5",
          isHero ? "text-white/60" : isWarn ? "text-warning" : "text-muted-foreground",
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />}
        <span className="text-[11px] font-semibold uppercase tracking-[0.3px]">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <div
          className={cn(
            "font-mono font-extrabold tracking-[-1px]",
            isHero ? "text-4xl" : "text-[28px]",
            isHero ? "text-white" : "text-ink",
          )}
        >
          {value}
        </div>
        {hint && (
          <div className={cn("text-[11px]", isHero ? "text-white/60" : "text-muted-foreground")}>
            {hint}
          </div>
        )}
      </div>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}
