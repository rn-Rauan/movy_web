import { useState } from "react";
import { Bus, Pencil, User, Users } from "lucide-react";
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
import { StatusPill } from "@/components/visual/StatusPill";
import { Timeline } from "@/components/visual/Timeline";
import { OccupancyBar } from "@/components/visual/OccupancyBar";
import { BookingRow } from "@/features/bookings/components/BookingRow";
import { DriverDisplayName } from "@/features/drivers/components/DriverDisplayName";
import { driverDisplayString } from "@/features/drivers/lib/driver-display";
import type {
  Booking,
  Driver,
  TripInstance,
  TripPassenger,
  TripStatus,
  Vehicle,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELED"],
  SCHEDULED: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["FINISHED"],
  FINISHED: [],
  CANCELED: [],
};

const DRIVER_ALLOWED_TRANSITIONS = new Set<TripStatus>(["IN_PROGRESS", "FINISHED"]);

const STATUS_ACTION_LABEL: Record<TripStatus, string> = {
  SCHEDULED: "Agendar",
  CONFIRMED: "Confirmar viagem",
  IN_PROGRESS: "Iniciar viagem",
  FINISHED: "Finalizar viagem",
  CANCELED: "Cancelar",
  DRAFT: "",
};

const DRIVER_STATUS_LABEL: Record<Driver["driverStatus"], string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  SUSPENDED: "Suspenso",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function initialsOf(name?: string | null) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type Props = {
  role: "admin" | "driver";
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
  role,
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
  const [editingDriver, setEditingDriver] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(false);

  const isAdmin = role === "admin";
  const allTransitions = STATUS_TRANSITIONS[trip.tripStatus] ?? [];
  const transitions = isAdmin
    ? allTransitions
    : allTransitions.filter((s) => DRIVER_ALLOWED_TRANSITIONS.has(s));
  const canEdit = isAdmin && !["FINISHED", "CANCELED"].includes(trip.tripStatus);
  const nonCancelTransitions = transitions.filter((s) => s !== "CANCELED");
  const namesByUserId = new Map(passengers.map((p) => [p.userId, p.name]));
  const origin = trip.template?.origin ?? trip.departurePoint ?? "—";
  const destination = trip.template?.destination ?? trip.destination ?? "—";
  const stops = (trip.template?.stops ?? []).map((s) => ({ name: s }));
  const assignedDriver = drivers.find((d) => d.id === trip.driverId) ?? null;
  const assignedVehicle = vehicles.find((v) => v.id === trip.vehicleId) ?? null;

  const dep = new Date(trip.departureTime);
  const date = Number.isNaN(dep.getTime())
    ? "—"
    : `${pad(dep.getUTCDate())}/${pad(dep.getUTCMonth() + 1)}`;
  const time = Number.isNaN(dep.getTime())
    ? ""
    : `${pad(dep.getUTCHours())}:${pad(dep.getUTCMinutes())}`;
  const arr = trip.arrivalEstimate ? new Date(trip.arrivalEstimate) : null;
  const arrival =
    arr && !Number.isNaN(arr.getTime())
      ? `${pad(arr.getUTCHours())}:${pad(arr.getUTCMinutes())}`
      : undefined;

  const hasSticky = transitions.length > 0;

  return (
    <div className={cn("flex flex-col gap-3.5", hasSticky && "pb-24")}>
      {/* Hero card */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
              Partida
            </div>
            <div className="mt-1 font-mono text-[36px] font-extrabold leading-none tracking-[-1.5px] text-ink">
              {time}
            </div>
            <div className="mt-1 font-mono text-[13px] font-semibold text-ink-2">{date}</div>
          </div>
          <StatusPill status={trip.tripStatus} />
        </div>

        {/* Ocupação */}
        <div className="mt-3 flex items-center gap-2.5 border-t border-line-soft pt-3">
          <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.7} />
          <div className="flex-1">
            <OccupancyBar booked={trip.bookedCount ?? 0} total={trip.totalCapacity ?? 0} />
          </div>
          <div className="text-[11px] font-semibold text-muted-foreground">vagas</div>
        </div>
      </div>

      {/* Timeline (paradas) */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
          Trajeto
        </div>
        <Timeline from={origin} to={destination} departure={time} arrival={arrival} stops={stops} />
      </div>

      {/* Motorista */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
            <User className="h-3.5 w-3.5" strokeWidth={1.8} />
            Motorista
          </div>
          {canEdit && !editingDriver && (
            <button
              onClick={() => setEditingDriver(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-line-soft text-ink-2 transition hover:bg-line"
              aria-label="Trocar motorista"
            >
              <Pencil className="h-3 w-3" strokeWidth={1.8} />
            </button>
          )}
        </div>

        {assignedDriver && !editingDriver ? (
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent-soft text-[13px] font-extrabold text-accent">
              {initialsOf(assignedDriver.userName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-[14px] font-extrabold text-ink">
                  <DriverDisplayName driver={assignedDriver} />
                </div>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    assignedDriver.driverStatus === "ACTIVE"
                      ? "bg-success-soft text-success"
                      : "bg-line-soft text-muted-foreground",
                  )}
                >
                  {DRIVER_STATUS_LABEL[assignedDriver.driverStatus]}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                CNH {assignedDriver.cnh} · Cat. {assignedDriver.cnhCategories.join(", ")} · Val.{" "}
                {new Date(assignedDriver.cnhExpiresAt).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>
        ) : canEdit ? (
          <div className="space-y-2">
            <Select
              value={trip.driverId ?? "none"}
              onValueChange={(v) => {
                onAssignDriver(v);
                setEditingDriver(false);
              }}
              disabled={assigningDriver}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem motorista</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id} textValue={driverDisplayString(d)}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        <DriverDisplayName driver={d} />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        CNH {d.cnh} · Cat. {d.cnhCategories.join(", ")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {assignedDriver && (
              <button
                onClick={() => setEditingDriver(false)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-ink"
              >
                Cancelar
              </button>
            )}
          </div>
        ) : (
          <div className="text-[12px] text-muted-foreground">Sem motorista atribuído.</div>
        )}
      </div>

      {/* Veículo */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
            <Bus className="h-3.5 w-3.5" strokeWidth={1.8} />
            Veículo
          </div>
          {canEdit && !editingVehicle && (
            <button
              onClick={() => setEditingVehicle(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-line-soft text-ink-2 transition hover:bg-line"
              aria-label="Trocar veículo"
            >
              <Pencil className="h-3 w-3" strokeWidth={1.8} />
            </button>
          )}
        </div>

        {assignedVehicle && !editingVehicle ? (
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-info-soft text-info">
              <Bus className="h-[20px] w-[20px]" strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-extrabold text-ink">{assignedVehicle.model}</div>
              <div className="mt-0.5 font-mono text-[12px] font-semibold tracking-[0.3px] text-ink-2">
                {assignedVehicle.plate}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {assignedVehicle.type} · {assignedVehicle.maxCapacity} lugares
              </div>
            </div>
          </div>
        ) : canEdit ? (
          <div className="space-y-2">
            <Select
              value={trip.vehicleId ?? "none"}
              onValueChange={(v) => {
                onAssignVehicle(v);
                setEditingVehicle(false);
              }}
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
            {assignedVehicle && (
              <button
                onClick={() => setEditingVehicle(false)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-ink"
              >
                Cancelar
              </button>
            )}
          </div>
        ) : (
          <div className="text-[12px] text-muted-foreground">Sem veículo atribuído.</div>
        )}
      </div>

      {/* Inscrições */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
          <Users className="h-3.5 w-3.5" strokeWidth={1.8} />
          Inscrições ({bookings.length})
        </div>
        {bookings.length === 0 ? (
          <div className="py-3 text-center text-[12px] text-muted-foreground">
            Nenhum passageiro inscrito.
          </div>
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
      </div>

      {/* Sticky action bar */}
      {hasSticky && (
        <div className="fixed inset-x-0 bottom-[76px] z-10 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl gap-2">
            {transitions.includes("CANCELED") && (
              <button
                onClick={() => setCancelDialog(true)}
                disabled={transitioning}
                className="flex-none rounded-xl border border-danger-soft bg-surface px-4 py-3 text-[13px] font-bold text-danger transition hover:bg-danger-soft disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            {nonCancelTransitions.map((next) => (
              <button
                key={next}
                onClick={() => onTransition(next)}
                disabled={transitioning}
                className="flex-1 rounded-xl bg-ink px-4 py-3 text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {transitioning ? "Atualizando..." : STATUS_ACTION_LABEL[next]}
              </button>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
