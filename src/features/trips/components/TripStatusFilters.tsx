import type { TripStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: TripStatus | "ALL" }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Rascunho", value: "DRAFT" },
  { label: "Agendada", value: "SCHEDULED" },
  { label: "Confirmada", value: "CONFIRMED" },
  { label: "Cancelada", value: "CANCELED" },
  { label: "Finalizada", value: "FINISHED" },
];

type Props = {
  value: TripStatus | "ALL";
  onChange: (v: TripStatus | "ALL") => void;
  /** Contagens opcionais por status para mostrar badge. */
  counts?: Partial<Record<TripStatus | "ALL", number>>;
};

export function TripStatusFilters({ value, onChange, counts }: Props) {
  return (
    <div className="-mx-4 mb-3 overflow-x-auto px-4">
      <div className="flex w-max gap-1.5 pb-1">
        {FILTERS.map((f) => {
          const active = value === f.value;
          const count = counts?.[f.value];
          return (
            <button
              key={f.value}
              onClick={() => onChange(f.value)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors",
                active
                  ? "bg-ink text-white"
                  : "border border-line bg-surface text-ink-2 hover:bg-surface-2",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[10px] font-bold",
                  active ? "bg-white/[0.15] text-white" : "bg-line-soft text-muted-foreground",
                )}
              >
                {count ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
