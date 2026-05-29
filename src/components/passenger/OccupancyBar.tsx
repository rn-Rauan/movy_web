import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  available: number;
  total: number;
  /** When `available <= warnAt`, switch to the warn color. Default 5. */
  warnAt?: number;
  className?: string;
};

export function OccupancyBar({ available, total, warnAt = 5, className }: Props) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.max(0, (available / safeTotal) * 100));
  const few = available <= warnAt;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Users className="h-3 w-3 text-muted-foreground" strokeWidth={1.6} />
      <div>
        <div className={cn("text-[11px] font-bold", few ? "text-warning" : "text-ink-2")}>
          {few ? `Só ${available} vagas` : `${available}/${total} vagas`}
        </div>
        <div className="mt-1 h-1 w-[60px] overflow-hidden rounded-full bg-line-soft">
          <div
            className={cn("h-full rounded-full", few ? "bg-warning" : "bg-accent")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
