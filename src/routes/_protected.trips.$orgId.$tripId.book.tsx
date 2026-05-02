import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";
import { AppShell } from "@/components/AppShell";
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
import type { TripInstance, EnrollmentType, PaymentMethod } from "@/lib/types";
import { canEnroll, formatDateTime, tripPriceFor } from "@/lib/format";

export const Route = createFileRoute("/_protected/trips/$orgId/$tripId/book")({
  component: BookPage,
});

const schema = z.object({
  enrollmentType: z.enum(["ONE_WAY", "RETURN", "ROUND_TRIP"]),
  boardingStop: z.string().trim().min(1, "Informe a parada de embarque"),
  alightingStop: z.string().trim().min(1, "Informe a parada de desembarque"),
  method: z.enum(["MONEY", "PIX", "CREDIT_CARD", "DEBIT_CARD"]),
});

function BookPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    enrollmentType: "ONE_WAY" as EnrollmentType,
    boardingStop: "",
    alightingStop: "",
    method: "PIX" as PaymentMethod,
  });

  useEffect(() => {
    tripsService
      .getPublicById(tripId)
      .then((t) => {
        setTrip(t);
        setForm((f) => ({
          ...f,
          boardingStop: f.boardingStop || t.departurePoint || "",
          alightingStop: f.alightingStop || t.destination || "",
        }));
      })
      .catch(() => {});
  }, [tripId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (trip && !canEnroll(trip.tripStatus)) {
      toast.error("Esta viagem não aceita inscrições no momento.");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await bookingsService.create({ tripInstanceId: tripId, ...parsed.data });
      toast.success("Inscrição realizada!");
      navigate({ to: "/_protected/my-bookings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na inscrição");
    } finally {
      setSubmitting(false);
    }
  }

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

      <form onSubmit={onSubmit} className="space-y-4">
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
