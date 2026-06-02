import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Users } from "lucide-react";
import { RouteVisualHorizontal } from "@/components/passenger/RouteVisualHorizontal";
import { OccupancyBar } from "@/components/visual/OccupancyBar";
import { formatDateTime } from "@/lib/format";
import { BR_TZ } from "@/lib/timezone";
import type { PublicTrip } from "../hooks/usePublicTrips";

interface PublicTripCardProps {
  trip: PublicTrip;
  /** Outras datas disponíveis da mesma rota (viagens recorrentes agrupadas). */
  extraDatesCount?: number;
  /** Inscritos reais (via /bookings/availability — só logado). Habilita a barra de ocupação estilo admin. */
  booked?: number | null;
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

export function PublicTripCard({ trip, extraDatesCount = 0, booked }: PublicTripCardProps) {
  const bookedCount = booked ?? trip.bookedCount;
  const hasOccupancy = bookedCount != null;
  const capacity = trip.totalCapacity;
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
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
            {date}
            {extraDatesCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">
                <CalendarDays className="h-2.5 w-2.5" strokeWidth={2} />+{extraDatesCount}{" "}
                {extraDatesCount === 1 ? "data" : "datas"}
              </span>
            )}
          </div>
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
        {hasOccupancy ? (
          <div className="max-w-[140px] flex-1">
            <OccupancyBar booked={bookedCount!} total={capacity ?? 0} />
          </div>
        ) : capacity != null ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-2">
            <Users className="h-3 w-3 text-muted-foreground" strokeWidth={1.6} />
            Até {capacity} lugares
          </span>
        ) : (
          <span />
        )}
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
