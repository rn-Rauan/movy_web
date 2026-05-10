import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useBookingForm } from "@/features/bookings/hooks/useBookingForm";
import { useUserBookingForTrip } from "@/features/bookings/hooks/useUserBookingForTrip";
import { formatDateTime, tripPriceFor } from "@/lib/format";
import type { EnrollmentType, PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_protected/trips/$orgId/$tripId/book")({
  component: BookPage,
});

function BookPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const { trip } = useTripDetail(tripId, { authenticated: true });
  const { booking: existingBooking, loading: checkingExisting } = useUserBookingForTrip(tripId);
  const { form, setForm, prefill, submit, submitting } = useBookingForm(tripId);

  useEffect(() => {
    if (trip) prefill(trip);
  }, [trip, prefill]);

  useEffect(() => {
    if (existingBooking) {
      toast.info("Você já está inscrito nesta viagem.");
      navigate({
        to: "/my-bookings/$bookingId",
        params: { bookingId: existingBooking.id },
        replace: true,
      });
    }
  }, [existingBooking, navigate]);

  const price = trip ? tripPriceFor(trip, form.enrollmentType) : undefined;

  const stopOptions = useMemo(() => {
    if (!trip) return [];
    const all = [
      trip.departurePoint,
      ...(trip.template?.stops ?? trip.stops ?? []),
      trip.destination,
    ].filter((s): s is string => Boolean(s && s.trim()));
    return Array.from(new Set(all));
  }, [trip]);

  return (
    <AppShell title="Inscrição" back>
      {trip ? (
        <Card className="p-4 mb-4 bg-accent/40">
          <p className="text-xs text-muted-foreground">Viagem</p>
          <p className="font-medium">
            {trip.departurePoint} → {trip.destination}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDateTime(trip.departureTime)}
          </p>
        </Card>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(trip);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Tipo de viagem</Label>
          <Select
            value={form.enrollmentType}
            onValueChange={(v) => setForm((f) => ({ ...f, enrollmentType: v as EnrollmentType }))}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trip?.priceOneWay != null || !trip ? (
                <SelectItem value="ONE_WAY">Somente ida</SelectItem>
              ) : null}
              {trip?.priceReturn != null ? (
                <SelectItem value="RETURN">Somente volta</SelectItem>
              ) : null}
              {trip?.priceRoundTrip != null || !trip ? (
                <SelectItem value="ROUND_TRIP">Ida e volta</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Parada de embarque</Label>
          <Select
            value={form.boardingStop}
            onValueChange={(v) => setForm((f) => ({ ...f, boardingStop: v }))}
            disabled={stopOptions.length === 0}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Selecione onde você sobe" />
            </SelectTrigger>
            <SelectContent>
              {stopOptions.map((stop) => (
                <SelectItem key={`b-${stop}`} value={stop} disabled={stop === form.alightingStop}>
                  {stop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Parada de desembarque</Label>
          <Select
            value={form.alightingStop}
            onValueChange={(v) => setForm((f) => ({ ...f, alightingStop: v }))}
            disabled={stopOptions.length === 0}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Selecione onde você desce" />
            </SelectTrigger>
            <SelectContent>
              {stopOptions.map((stop) => (
                <SelectItem key={`a-${stop}`} value={stop} disabled={stop === form.boardingStop}>
                  {stop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Método de pagamento</Label>
          <Select
            value={form.method}
            onValueChange={(v) => setForm((f) => ({ ...f, method: v as PaymentMethod }))}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="CREDIT_CARD">Cartão de crédito</SelectItem>
              <SelectItem value="DEBIT_CARD">Cartão de débito</SelectItem>
              <SelectItem value="MONEY">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {price != null ? (
          <Card className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="text-lg font-semibold">R$ {price.toFixed(2)}</span>
          </Card>
        ) : null}

        <Button
          type="submit"
          disabled={submitting || checkingExisting || Boolean(existingBooking)}
          className="w-full h-12 text-base"
        >
          {submitting ? "Confirmando..." : "Confirmar inscrição"}
        </Button>
      </form>
    </AppShell>
  );
}
