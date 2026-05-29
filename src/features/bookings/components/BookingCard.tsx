import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, ChevronRight } from "lucide-react";
import type { Booking } from "@/lib/types";
import { bookingStatusLabel, formatDateTime, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const isActive = booking.status === "ACTIVE";
  const isCancelled = booking.status === "INACTIVE";
  const trip = booking.tripInstance;
  const departureIso = trip?.departureTime ?? booking.enrollmentDate;
  const orgName = trip?.organizationName;
  const price = booking.recordedPrice;
  const shortId = booking.id.slice(0, 8).toUpperCase();

  return (
    <Link
      to="/my-bookings/$bookingId"
      params={{ bookingId: booking.id }}
      className={cn(
        "block rounded-[14px] border border-line bg-surface p-3.5 transition-colors hover:border-ink-2",
        isCancelled && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-ink">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
          <span className="font-mono text-[13px] font-extrabold tracking-[-0.2px]">
            {formatDateTime(departureIso)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-[3px] text-[10px] font-bold",
              isActive
                ? "bg-ink text-surface"
                : isCancelled
                  ? "bg-danger-soft text-danger line-through"
                  : "bg-line-soft text-ink-2",
            )}
          >
            {bookingStatusLabel(booking.status)}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[14px] text-ink-2">
        <span className="font-bold text-ink">{booking.boardingStop}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
        <span className="font-bold text-ink">{booking.alightingStop}</span>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-dashed border-line pt-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {orgName && <span className="font-bold text-ink-2">{orgName}</span>}
          {orgName && <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground" />}
          <span className="font-mono">{shortId}</span>
        </div>
        {price != null && (
          <span className="font-mono font-bold text-ink">{formatPrice(price)}</span>
        )}
      </div>
    </Link>
  );
}
