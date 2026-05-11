import type { TripStatus } from "@/lib/types";

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
};

export function TripStatusFilters({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
            value === f.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
