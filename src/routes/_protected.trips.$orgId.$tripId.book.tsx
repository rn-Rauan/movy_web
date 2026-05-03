import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDateTime, tripPriceFor } from "@/lib/format";
import type { EnrollmentType, PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_protected/trips/$orgId/$tripId/book")({
  component: BookPage,
});

function BookPage() {
  const { tripId } = Route.useParams();
  const { trip } = useTripDetail(tripId);
  const { form, setForm, prefill, submit, submitting } = useBookingForm(tripId);

  useEffect(() => {
    if (trip) prefill(trip);
  }, [trip, prefill]);

  const price = trip ? tripPriceFor(trip, form.enrollmentType) : undefined;

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
          <Label htmlFor="boardingStop">Parada de embarque</Label>
          <Input
            id="boardingStop"
            value={form.boardingStop}
            onChange={(e) => setForm((f) => ({ ...f, boardingStop: e.target.value }))}
            placeholder={trip?.departurePoint || "Ex: Terminal Rodoviário"}
            className="h-12 text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alightingStop">Parada de desembarque</Label>
          <Input
            id="alightingStop"
            value={form.alightingStop}
            onChange={(e) => setForm((f) => ({ ...f, alightingStop: e.target.value }))}
            placeholder={trip?.destination || "Ex: Universidade"}
            className="h-12 text-base"
            required
          />
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

        <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
          {submitting ? "Confirmando..." : "Confirmar inscrição"}
        </Button>
      </form>
    </AppShell>
  );
}
