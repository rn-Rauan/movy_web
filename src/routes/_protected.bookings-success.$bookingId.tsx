import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { CheckCircle2, Calendar, MapPin, CreditCard, User, Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useBookingDetail } from "@/features/bookings/hooks/useBookingDetail";
import { formatDateTime, paymentMethodLabel, formatPrice } from "@/lib/format";
import type { BookingDetails } from "@/lib/types";

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
      <div className="flex flex-col items-center text-center mb-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <CheckCircle2 className="h-14 w-14 text-primary" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold">Reserva confirmada!</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Sua viagem está garantida. Boa viagem! 🚌
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
  const origin = trip?.departurePoint;
  const destination = trip?.destination;

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
      <Card className="p-5 mb-6 space-y-3">
        {origin || destination ? (
          <div className="pb-3 border-b">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Trajeto</p>
            <p className="font-semibold">
              {origin ?? "—"} <span className="text-muted-foreground">→</span> {destination ?? "—"}
            </p>
          </div>
        ) : null}

        <Row icon={<Calendar className="h-4 w-4" />} label="Data e hora">
          {formatDateTime(departure)}
        </Row>
        <Row icon={<MapPin className="h-4 w-4" />} label="Embarque">
          {booking.boardingStop}
        </Row>
        <Row icon={<MapPin className="h-4 w-4" />} label="Desembarque">
          {booking.alightingStop}
        </Row>
        {trip?.driverId ? (
          <Row icon={<User className="h-4 w-4" />} label="Motorista">
            {trip.driverId}
          </Row>
        ) : null}
        {booking.paymentMethod ? (
          <Row icon={<CreditCard className="h-4 w-4" />} label="Pagamento">
            <Badge variant="secondary">{paymentMethodLabel(booking.paymentMethod)}</Badge>
          </Row>
        ) : null}
        {booking.recordedPrice != null ? (
          <Row icon={<CreditCard className="h-4 w-4" />} label="Valor">
            <span className="font-semibold">{formatPrice(booking.recordedPrice)}</span>
          </Row>
        ) : null}
      </Card>

      <div className="space-y-2">
        <Button asChild className="w-full h-12 text-base">
          <Link to="/my-bookings">Ver minhas reservas</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full h-12 text-base">
          <Link to="/public/trip-instances">Explorar mais viagens</Link>
        </Button>
        <Button variant="ghost" className="w-full h-12 text-base" onClick={downloadIcs}>
          <Download className="h-4 w-4" />
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
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm gap-3">
      <span className="flex items-center gap-2 text-muted-foreground shrink-0">
        {icon}
        {label}
      </span>
      <span className="font-medium text-right truncate">{children}</span>
    </div>
  );
}

function toIcsDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildIcs(booking: BookingDetails): string {
  const start = booking.tripDepartureTime || booking.enrollmentDate;
  const end = booking.tripArrivalEstimate || start;
  const trip = booking.tripInstance;
  const summary = trip?.departurePoint && trip?.destination
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