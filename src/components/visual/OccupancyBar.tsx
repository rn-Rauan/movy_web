import { cn } from "@/lib/utils";

export type OccupancyBarProps = {
  booked: number;
  total: number;
  /** Renderiza a barra em cinza (ex.: viagem cancelada), independente da ocupação. */
  muted?: boolean;
  className?: string;
};

export function OccupancyBar({ booked, total, muted, className }: OccupancyBarProps) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (booked / total) * 100)) : 0;
  const fill = muted ? "bg-muted-foreground" : pct >= 50 ? "bg-success" : "bg-accent";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="font-mono text-[11px] font-bold text-ink-2">
        {booked}
        <span className="font-medium text-muted-foreground">/{total}</span>
      </div>
    </div>
  );
}
