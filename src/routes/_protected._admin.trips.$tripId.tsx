import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Bus, Users, Clock, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { BookingRow } from "@/features/bookings/components/BookingRow";
import { useRole } from "@/lib/role-context";
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";
import { driversService } from "@/services/drivers.service";
import { vehiclesService } from "@/services/vehicles.service";
import { templatesService } from "@/services/templates.service";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type {
  TripInstance,
  TripStatus,
  TripPassenger,
  Driver,
  Vehicle,
  TripTemplate,
  Booking,
  Paginated,
} from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/trips/$tripId")({
  component: TripDetailPage,
});

const STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELED"],
  SCHEDULED: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["FINISHED"],
  FINISHED: [],
  CANCELED: [],
};

const STATUS_ACTION_LABEL: Record<TripStatus, string> = {
  SCHEDULED: "Agendar",
  CONFIRMED: "Confirmar",
  IN_PROGRESS: "Iniciar viagem",
  FINISHED: "Finalizar",
  CANCELED: "Cancelar",
  DRAFT: "",
};

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const { adminOrgId } = useRole();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [template, setTemplate] = useState<TripTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [transitioning, setTransitioning] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [assigningVehicle, setAssigningVehicle] = useState(false);
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  useEffect(() => {
    tripsService
      .getById(tripId)
      .then(setTrip)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar viagem"));
  }, [tripId]);

  useEffect(() => {
    if (!trip?.tripTemplateId) return;
    templatesService
      .getById(trip.tripTemplateId)
      .then(setTemplate)
      .catch(() => {});
  }, [trip?.tripTemplateId]);

  useEffect(() => {
    if (!tripId || !trip) return;
    tripsService
      .listPassengers(tripId)
      .then(setPassengers)
      .catch(() => {});
    bookingsService
      .listByTripInstance(tripId)
      .then((res) =>
        setBookings(Array.isArray(res) ? res : ((res as Paginated<Booking>).data ?? [])),
      )
      .catch(() => {});
  }, [tripId, trip]);

  useEffect(() => {
    if (!adminOrgId) return;
    driversService
      .listByOrgId(adminOrgId)
      .then((res) => setDrivers(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
    vehiclesService
      .listByOrgId(adminOrgId)
      .then((res) => setVehicles(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
  }, [adminOrgId]);

  async function transitionStatus(newStatus: TripStatus) {
    if (!trip) return;
    setTransitioning(true);
    try {
      const updated = await tripsService.updateStatus(trip.id, newStatus);
      setTrip(updated);
      toast.success(`Viagem ${statusLabel(newStatus).toLowerCase()}`);
      if (newStatus === "CANCELED") navigate({ to: "/trips" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status");
    } finally {
      setTransitioning(false);
      setCancelDialog(false);
    }
  }

  async function handleDriverChange(driverId: string) {
    if (!trip) return;
    setAssigningDriver(true);
    try {
      const updated = await tripsService.assignDriver(
        trip.id,
        driverId === "none" ? undefined : driverId,
      );
      setTrip(updated);
      toast.success("Motorista atualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atribuir motorista");
    } finally {
      setAssigningDriver(false);
    }
  }

  async function handleConfirmPresence(bookingId: string) {
    setBusyBookingId(bookingId);
    try {
      const updated = await bookingsService.confirmPresence(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      toast.success("Presença confirmada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao confirmar presença");
    } finally {
      setBusyBookingId(null);
    }
  }

  async function handleCancelBooking(bookingId: string) {
    setBusyBookingId(bookingId);
    try {
      const updated = await bookingsService.cancel(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      toast.success("Inscrição cancelada");
      try {
        const refreshed = await tripsService.getById(tripId);
        setTrip(refreshed);
      } catch {
        // silent
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao cancelar inscrição";
      const friendly =
        /30/.test(raw) || /minute/i.test(raw)
          ? "Cancelamento não permitido a menos de 30 minutos da partida"
          : raw;
      toast.error(friendly);
    } finally {
      setBusyBookingId(null);
      setCancelBooking(null);
    }
  }

  async function handleVehicleChange(vehicleId: string) {
    if (!trip) return;
    setAssigningVehicle(true);
    try {
      const updated = await tripsService.assignVehicle(
        trip.id,
        vehicleId === "none" ? undefined : vehicleId,
      );
      setTrip(updated);
      toast.success("Veículo atualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atribuir veículo");
    } finally {
      setAssigningVehicle(false);
    }
  }

  if (error) {
    return (
      <AppShell title="Viagem" back>
        <ErrorCard message={error} />
      </AppShell>
    );
  }

  if (!trip) {
    return (
      <AppShell title="Viagem" back>
        <LoadingList count={3} height="h-24" />
      </AppShell>
    );
  }

  const transitions = STATUS_TRANSITIONS[trip.tripStatus] ?? [];
  const canEdit = !["FINISHED", "CANCELED"].includes(trip.tripStatus);
  const nonCancelTransitions = transitions.filter((s) => s !== "CANCELED");
  const namesByUserId = new Map(passengers.map((p) => [p.userId, p.name]));

  return (
    <AppShell title="Detalhes da viagem" back>
      {/* Header card */}
      <Card className="p-4 mb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="text-sm font-semibold mb-0.5">{formatDateTime(trip.departureTime)}</div>
            {trip.arrivalEstimate && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Chegada: {formatDateTime(trip.arrivalEstimate)}
              </div>
            )}
          </div>
          <Badge variant={statusVariant(trip.tripStatus)}>{statusLabel(trip.tripStatus)}</Badge>
        </div>

        {(template?.departurePoint || template?.destination) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 shrink-0" />
            {template?.departurePoint ?? "—"} → {template?.destination ?? "—"}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {trip.bookedCount ?? 0} / {trip.totalCapacity} lugares
        </div>

        {template?.stops && template.stops.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1.5">Paradas</div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              {template.stops.map((stop, i) => (
                <li key={i}>{stop}</li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      {/* Driver assignment */}
      {canEdit && (
        <Card className="p-4 mb-3">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium">
            <User className="h-4 w-4" /> Motorista
          </div>
          <Select
            value={trip.driverId ?? "none"}
            onValueChange={handleDriverChange}
            disabled={assigningDriver}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sem motorista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem motorista</SelectItem>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.userName ? `${d.userName} — CNH ${d.cnh}` : `CNH ${d.cnh}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {/* Vehicle assignment */}
      {canEdit && (
        <Card className="p-4 mb-3">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium">
            <Bus className="h-4 w-4" /> Veículo
          </div>
          <Select
            value={trip.vehicleId ?? "none"}
            onValueChange={handleVehicleChange}
            disabled={assigningVehicle}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sem veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem veículo</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.model} — {v.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {/* Status actions */}
      {transitions.length > 0 && (
        <div className="space-y-2 mb-3">
          {nonCancelTransitions.map((next) => (
            <Button
              key={next}
              className="w-full"
              onClick={() => transitionStatus(next)}
              disabled={transitioning}
            >
              {transitioning ? "Atualizando..." : STATUS_ACTION_LABEL[next]}
            </Button>
          ))}
          {transitions.includes("CANCELED") && (
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => setCancelDialog(true)}
              disabled={transitioning}
            >
              Cancelar viagem
            </Button>
          )}
        </div>
      )}

      {/* Bookings list */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium">
          <Users className="h-4 w-4" />
          Inscrições ({bookings.length})
        </div>
        {bookings.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhum passageiro inscrito.
          </p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                passengerName={namesByUserId.get(b.userId)}
                onConfirmPresence={handleConfirmPresence}
                onCancel={(id) => {
                  const target = bookings.find((x) => x.id === id);
                  if (target) setCancelBooking(target);
                }}
                busy={busyBookingId === b.id}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Cancel trip confirmation */}
      <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar viagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os passageiros serão notificados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => transitionStatus("CANCELED")}
              disabled={transitioning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {transitioning ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel booking confirmation */}
      <AlertDialog open={!!cancelBooking} onOpenChange={(o) => !o && setCancelBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar inscrição?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelBooking
                ? `${namesByUserId.get(cancelBooking.userId) ?? "O passageiro"} será removido da viagem e a vaga ficará disponível.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBooking && handleCancelBooking(cancelBooking.id)}
              disabled={busyBookingId === cancelBooking?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyBookingId === cancelBooking?.id ? "Cancelando..." : "Cancelar inscrição"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
