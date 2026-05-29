import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { ArrowRight, CheckCircle2, Download, MapPin, User } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useBookingDetail } from "@/features/bookings/hooks/useBookingDetail";
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import { formatDateTime, paymentMethodLabel, formatPrice, formatFullDate } from "@/lib/format";
import type { BookingDetails } from "@/lib/types";
import { RouteVisualTimeline } from "@/components/passenger/RouteVisualTimeline";

export const Route = createFileRoute("/_protected/bookings-success/$bookingId")({
  component: BookingSuccessPage,
});

function BookingSuccessPage() {
  const { bookingId } = Route.useParams();
  const { booking, loading, error } = useBookingDetail(bookingId);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.3 },
    });
  }, []);

  return (
    <AppShell title="Confirmação" showTabs={false}>
      <div className="mb-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft">
          <CheckCircle2 className="h-9 w-9 text-success" strokeWidth={2} />
        </div>
        <h2 className="text-balance text-[24px] font-extrabold tracking-[-0.6px] text-ink">
          Reserva confirmada!
        </h2>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Sua viagem está garantida. Boa viagem!
        </p>
      </div>

      {loading ? (
        <LoadingList count={1} height="h-48" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : booking ? (
        <SuccessContent booking={booking} />
      ) : null}
    </AppShell>
  );
}

function SuccessContent({ booking }: { booking: BookingDetails }) {
  const departure = booking.tripDepartureTime || booking.enrollmentDate;
  const trip = booking.tripInstance;
  const { name: driverName } = useDriverName(trip?.driverId);

  function downloadIcs() {
    const ics = buildIcs(booking);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viagem-${booking.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <article className="mb-4 rounded-2xl border border-line bg-surface p-4">
        <header className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
            Data da viagem
          </div>
          <div className="mt-1 text-balance text-[17px] font-extrabold capitalize tracking-[-0.4px] text-ink">
            {formatFullDate(departure)}
          </div>
        </header>

        <RouteVisualTimeline
          origin={{
            name: booking.boardingStop,
            time: formatDateTime(departure, true),
          }}
          destination={{
            name: booking.alightingStop,
            time: booking.tripArrivalEstimate
              ? formatDateTime(booking.tripArrivalEstimate, true)
              : undefined,
            estimatedArrival: !!booking.tripArrivalEstimate,
          }}
          className="mt-2"
        />

        <div className="mt-4 flex flex-col gap-2 border-t border-dashed border-line pt-3 text-[12px]">
          {driverName && (
            <Row icon={<User className="h-3.5 w-3.5" strokeWidth={1.6} />} label="Motorista">
              {driverName}
            </Row>
          )}
          {trip?.organizationName && (
            <Row icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.6} />} label="Empresa">
              {trip.organizationName}
            </Row>
          )}
          {booking.paymentMethod && (
            <Row label="Pagamento">
              <span className="rounded-full bg-line-soft px-2 py-px text-[11px] font-bold text-ink-2">
                {paymentMethodLabel(booking.paymentMethod)}
              </span>
            </Row>
          )}
          {booking.recordedPrice != null && (
            <Row label="Valor">
              <span className="font-mono font-bold text-ink">
                {formatPrice(booking.recordedPrice)}
              </span>
            </Row>
          )}
        </div>
      </article>

      <div className="flex flex-col gap-2">
        <Button
          asChild
          className="h-12 w-full gap-2 rounded-[12px] bg-ink text-[14px] font-bold text-surface hover:bg-ink/90"
        >
          <Link to="/my-bookings">
            Ver minhas inscrições <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-12 w-full rounded-[12px] border-line text-[14px] font-bold text-ink"
        >
          <Link to="/public/trip-instances">Explorar mais viagens</Link>
        </Button>
        <Button
          variant="ghost"
          className="h-11 w-full gap-2 rounded-[12px] text-[13px] font-semibold text-ink-2"
          onClick={downloadIcs}
        >
          <Download className="h-4 w-4" strokeWidth={1.6} />
          Adicionar ao calendário
        </Button>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="truncate text-right font-semibold text-ink-2">{children}</span>
    </div>
  );
}

function toIcsDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function buildIcs(booking: BookingDetails): string {
  const start = booking.tripDepartureTime || booking.enrollmentDate;
  const end = booking.tripArrivalEstimate || start;
  const trip = booking.tripInstance;
  const summary =
    trip?.departurePoint && trip?.destination
      ? `Viagem: ${trip.departurePoint} → ${trip.destination}`
      : "Viagem reservada";
  const description = `Embarque: ${booking.boardingStop}\\nDesembarque: ${booking.alightingStop}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Movy//Booking//PT-BR",
    "BEGIN:VEVENT",
    `UID:${booking.id}@movy`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${booking.boardingStop}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
