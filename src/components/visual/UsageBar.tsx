import { cn } from "@/lib/utils";

export type UsageBarProps = {
  label: string;
  used: number;
  max: number;
  unit?: string;
  /** Mostrar barra de progresso (default true). Use false pra valores sentinela tipo "ilimitado". */
  showBar?: boolean;
  /** Texto custom no lugar de "used / max" (ex.: "Ilimitado"). */
  valueLabel?: string;
  className?: string;
};

export function UsageBar({
  label,
  used,
  max,
  unit,
  showBar = true,
  valueLabel,
  className,
}: UsageBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (used / max) * 100)) : 0;
  const tone = pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-success";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-semibold text-ink-2">{label}</span>
        <span className="font-mono text-[12px] font-semibold text-ink">
          {valueLabel ?? (
            <>
              {used}
              <span className="text-muted-foreground font-normal">
                /{max}
                {unit ? ` ${unit}` : ""}
              </span>
            </>
          )}
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
          <div
            className={cn("h-full rounded-full transition-[width] duration-300", tone)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
