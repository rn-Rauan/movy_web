import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { RouteVisual } from "@/components/visual/RouteVisual";
import { OccupancyBar } from "@/components/visual/OccupancyBar";
import { StatusPill } from "@/components/visual/StatusPill";
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import type { TripInstance } from "@/lib/types";

function initialsOf(name?: string | null) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function AdminTripCard({ trip: t }: { trip: TripInstance }) {
  const { name: driverName } = useDriverName(t.driverId);

  const dep = new Date(t.departureTime);
  const date = Number.isNaN(dep.getTime())
    ? "—"
    : `${String(dep.getUTCDate()).padStart(2, "0")}/${String(dep.getUTCMonth() + 1).padStart(2, "0")}`;
  const time = Number.isNaN(dep.getTime())
    ? ""
    : `${String(dep.getUTCHours()).padStart(2, "0")}:${String(dep.getUTCMinutes()).padStart(2, "0")}`;

  const from = t.template?.origin ?? t.departurePoint ?? "—";
  const to = t.template?.destination ?? t.destination ?? "—";

  return (
    <Link
      to="/trip/$tripId"
      params={{ tripId: t.id }}
      className="block rounded-2xl border border-line bg-surface p-3.5 transition hover:bg-surface-2 active:opacity-80"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <div className="font-mono text-[20px] font-extrabold leading-none tracking-[-0.6px] text-ink">
            {date}
          </div>
          <div className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.8} />
            {time}
          </div>
        </div>
        <StatusPill status={t.tripStatus} />
      </div>

      <RouteVisual from={from} to={to} />

      <div className="mt-3 flex items-center gap-3">
        {t.driverId && (
          <div className="flex flex-none items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-[9px] font-extrabold text-accent">
              {initialsOf(driverName)}
            </div>
            <span className="max-w-[110px] truncate text-[11px] font-semibold text-ink-2">
              {driverName ?? "—"}
            </span>
          </div>
        )}
        <div className="flex-1">
          <OccupancyBar booked={t.bookedCount ?? 0} total={t.totalCapacity ?? 0} />
        </div>
      </div>
    </Link>
  );
}
