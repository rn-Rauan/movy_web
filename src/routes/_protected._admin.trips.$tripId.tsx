import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Bus, Users, Clock, MapPin, ChevronRight } from "lucide-react";
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
import { useRole } from "@/lib/role-context";
import { tripsService } from "@/services/trips.service";
import { driversService } from "@/services/drivers.service";
import { vehiclesService } from "@/services/vehicles.service";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { TripInstance, TripStatus, TripPassenger, Driver, Vehicle } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [transitioning, setTransitioning] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [assigningVehicle, setAssigningVehicle] = useState(false);

  useEffect(() => {
    tripsService
      .getById(tripId)
      .then(setTrip)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar viagem"));
  }, [tripId]);

  useEffect(() => {
    if (!tripId || !trip) return;
    tripsService
      .listPassengers(tripId)
      .then(setPassengers)
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

        {(trip.departurePoint || trip.destination) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 shrink-0" />
            {trip.departurePoint ?? "—"} → {trip.destination ?? "—"}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {trip.bookedCount ?? 0} / {trip.totalCapacity} lugares
        </div>
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

      {/* Passengers list */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium">
          <Users className="h-4 w-4" />
          Passageiros ({passengers.length})
        </div>
        {passengers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhum passageiro inscrito.
          </p>
        ) : (
          <div className="space-y-2">
            {passengers.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm py-1 border-b last:border-0"
              >
                <span>{p.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {p.boardingStop}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cancel confirmation */}
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
    </AppShell>
  );
}
