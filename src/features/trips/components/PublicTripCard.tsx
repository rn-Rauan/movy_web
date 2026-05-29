import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { RouteVisualHorizontal } from "@/components/passenger/RouteVisualHorizontal";
import { OccupancyBar } from "@/components/passenger/OccupancyBar";
import { formatDateTime } from "@/lib/format";
import { BR_TZ } from "@/lib/timezone";
import type { PublicTrip } from "../hooks/usePublicTrips";

interface PublicTripCardProps {
  trip: PublicTrip;
}

function formatBrShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: BR_TZ,
  });
}

export function PublicTripCard({ trip }: PublicTripCardProps) {
  const seats = trip.availableSlots ?? trip.totalCapacity;
  const total = trip.totalCapacity ?? seats;
  const price = trip.priceOneWay;
  const time = formatDateTime(trip.departureTime, true);
  const date = formatBrShortDate(trip.departureTime);
  const company = trip.organizationName ?? "Empresa";
  const initial = company.charAt(0).toUpperCase();

  return (
    <Link
      to="/public/trip-instances/$id"
      params={{ id: trip.id }}
      className="block rounded-[14px] border border-line bg-surface p-3.5 transition-colors hover:border-ink-2"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-mono text-[20px] font-extrabold leading-none tracking-[-0.5px] text-ink">
            {time}
          </div>
          <div className="mt-1 text-[11px] font-bold text-muted-foreground">{date}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent-soft text-[9px] font-extrabold text-accent">
            {initial}
          </span>
          <span className="text-[11px] font-bold text-ink-2">{company}</span>
        </div>
      </div>

      <RouteVisualHorizontal from={trip.departurePoint ?? "—"} to={trip.destination ?? "—"} />

      <div className="mt-3.5 flex items-center justify-between gap-2.5 border-t border-dashed border-line pt-3">
        <OccupancyBar available={seats} total={total} />
        <div className="flex items-center gap-2.5">
          {price != null && (
            <div className="text-right">
              <div className="text-[9px] font-semibold uppercase tracking-[0.3px] text-muted-foreground">
                a partir de
              </div>
              <div className="font-mono text-[16px] font-extrabold leading-none tracking-[-0.3px] text-ink">
                R$ {price.toFixed(0)}
              </div>
            </div>
          )}
          <span className="inline-flex items-center gap-1 rounded-[10px] bg-ink px-3.5 py-2.5 text-[12px] font-bold text-surface">
            Reservar <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}
