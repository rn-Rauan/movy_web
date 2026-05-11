import { useState } from "react";
import { Bus, Clock, MapPin, User, Users } from "lucide-react";
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
import { BookingRow } from "@/features/bookings/components/BookingRow";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type {
  Booking,
  Driver,
  TripInstance,
  TripPassenger,
  TripStatus,
  Vehicle,
} from "@/lib/types";

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

type Props = {
  trip: TripInstance;
  passengers: TripPassenger[];
  bookings: Booking[];
  drivers: Driver[];
  vehicles: Vehicle[];
  transitioning: boolean;
  assigningDriver: boolean;
  assigningVehicle: boolean;
  busyBookingId: string | null;
  onTransition: (s: TripStatus) => void;
  onAssignDriver: (id: string) => void;
  onAssignVehicle: (id: string) => void;
  onConfirmPresence: (id: string) => void;
  onCancelBooking: (id: string) => Promise<void>;
};

export function AdminTripDetailView({
  trip,
  passengers,
  bookings,
  drivers,
  vehicles,
  transitioning,
  assigningDriver,
  assigningVehicle,
  busyBookingId,
  onTransition,
  onAssignDriver,
  onAssignVehicle,
  onConfirmPresence,
  onCancelBooking,
}: Props) {
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  const transitions = STATUS_TRANSITIONS[trip.tripStatus] ?? [];
  const canEdit = !["FINISHED", "CANCELED"].includes(trip.tripStatus);
  const nonCancelTransitions = transitions.filter((s) => s !== "CANCELED");
  const namesByUserId = new Map(passengers.map((p) => [p.userId, p.name]));
  const origin = trip.template?.origin ?? trip.departurePoint;
  const destination = trip.template?.destination ?? trip.destination;
  const stops = trip.template?.stops ?? [];

  return (
    <>
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

        {(origin || destination) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 shrink-0" />
            {origin ?? "—"} → {destination ?? "—"}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {trip.bookedCount ?? 0} / {trip.totalCapacity} lugares
        </div>

        {stops.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1.5">Paradas</div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              {stops.map((stop, i) => (
                <li key={i}>{stop}</li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      {canEdit && (
        <Card className="p-4 mb-3">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium">
            <User className="h-4 w-4" /> Motorista
          </div>
          <Select
            value={trip.driverId ?? "none"}
            onValueChange={onAssignDriver}
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

      {canEdit && (
        <Card className="p-4 mb-3">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium">
            <Bus className="h-4 w-4" /> Veículo
          </div>
          <Select
            value={trip.vehicleId ?? "none"}
            onValueChange={onAssignVehicle}
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

      {transitions.length > 0 && (
        <div className="space-y-2 mb-3">
          {nonCancelTransitions.map((next) => (
            <Button
              key={next}
              className="w-full"
              onClick={() => onTransition(next)}
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
                onConfirmPresence={onConfirmPresence}
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
              onClick={() => {
                onTransition("CANCELED");
                setCancelDialog(false);
              }}
              disabled={transitioning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {transitioning ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              onClick={async () => {
                if (cancelBooking) {
                  await onCancelBooking(cancelBooking.id);
                  setCancelBooking(null);
                }
              }}
              disabled={busyBookingId === cancelBooking?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyBookingId === cancelBooking?.id ? "Cancelando..." : "Cancelar inscrição"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
