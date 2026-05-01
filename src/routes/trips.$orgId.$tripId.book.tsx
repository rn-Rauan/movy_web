import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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
import type { TripInstance } from "@/lib/types";
import { canEnroll, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/trips/$orgId/$tripId/book")({
  component: BookPage,
});

const schema = z.object({
  enrollmentType: z.enum(["ONE_WAY", "ROUND_TRIP"]),
  boardingStop: z.string().trim().min(1, "Informe a parada de embarque"),
  alightingStop: z.string().trim().min(1, "Informe a parada de desembarque"),
  method: z.string().trim().min(1, "Informe o método"),
});

function BookPage() {
  const { tripId } = Route.useParams();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    enrollmentType: "ONE_WAY" as "ONE_WAY" | "ROUND_TRIP",
    boardingStop: "",
    alightingStop: "",
    method: "PIX",
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api<TripInstance>(`/public/trip-instances/${tripId}`, { auth: false }).then(setTrip).catch(() => {});
  }, [tripId, isAuthenticated]);

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
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({ tripInstanceId: tripId, ...parsed.data }),
      });
      toast.success("Inscrição realizada!");
      navigate({ to: "/my-bookings" });
    } catch (err: any) {
      toast.error(err.message ?? "Falha na inscrição");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Inscrição" back>
      {trip ? (
        <Card className="p-4 mb-4 bg-accent/40">
          <p className="text-xs text-muted-foreground">Viagem</p>
          <p className="font-medium">{formatDateTime(trip.departureTime)}</p>
        </Card>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo de viagem</Label>
          <Select
            value={form.enrollmentType}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, enrollmentType: v as any }))
            }
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONE_WAY">Somente ida</SelectItem>
              <SelectItem value="ROUND_TRIP">Ida e volta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="boardingStop">Parada de embarque</Label>
          <Input
            id="boardingStop"
            value={form.boardingStop}
            onChange={(e) =>
              setForm((f) => ({ ...f, boardingStop: e.target.value }))
            }
            placeholder="Ex: A2"
            className="h-12 text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alightingStop">Parada de desembarque</Label>
          <Input
            id="alightingStop"
            value={form.alightingStop}
            onChange={(e) =>
              setForm((f) => ({ ...f, alightingStop: e.target.value }))
            }
            placeholder="Ex: B5"
            className="h-12 text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Método de pagamento</Label>
          <Select
            value={form.method}
            onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="CREDIT_CARD">Cartão de crédito</SelectItem>
              <SelectItem value="CASH">Dinheiro</SelectItem>
              <SelectItem value="SUBSCRIPTION">Assinatura</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 text-base"
        >
          {submitting ? "Confirmando..." : "Confirmar inscrição"}
        </Button>
      </form>
    </AppShell>
  );
}