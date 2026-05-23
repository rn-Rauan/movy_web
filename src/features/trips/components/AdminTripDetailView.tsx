import { useState } from "react";
import { ArrowLeftRight, Bus, Check, Clock, Ticket, User, Users, X as XIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import { driverDisplayString } from "@/features/drivers/lib/driver-display";
import { formatDateOnly } from "@/lib/format";
import { BR_TZ, getBrDayOfMonth, getBrHour, getBrMinute, getBrMonth } from "@/lib/timezone";
import type {
  Booking,
  Driver,
  Payment,
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

/** "QUINTA · 22 DE MAIO" — dia da semana em BR + dia + mês extenso, uppercase. */
function formatBrDateLong(d: Date): string {
  const weekday = d
    .toLocaleDateString("pt-BR", { weekday: "long", timeZone: BR_TZ })
    .replace(/-feira$/i, "");
  const day = pad(getBrDayOfMonth(d));
  const month = d.toLocaleDateString("pt-BR", { month: "long", timeZone: BR_TZ });
  return `${weekday} · ${day} DE ${month}`.toUpperCase();
}

function firstLetterOf(name?: string | null) {
  if (!name) return "—";
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : "—";
}

function DriverAvatar({ driver }: { driver: Driver }) {
  // Resolve nome via cache global do useDriverName quando o payload do driver
  // não trouxer userName/userEmail (caso comum em GET /drivers/organization/:id).
  const { name } = useDriverName(driver.id);
  const resolved = driver.userName ?? driver.userEmail ?? name ?? null;
  return (
    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-accent-soft text-[16px] font-extrabold tracking-[-0.5px] text-accent">
      {firstLetterOf(resolved)}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      <span className="text-[11px] font-bold uppercase tracking-[0.4px]">{children}</span>
    </div>
  );
}

type Props = {
  role: "admin" | "driver";
  trip: TripInstance;
  passengers: TripPassenger[];
  bookings: Booking[];
  drivers: Driver[];
  vehicles: Vehicle[];
  paymentsByBookingId: Map<string, Payment>;
  transitioning: boolean;
  assigningDriver: boolean;
  assigningVehicle: boolean;
  busyBookingId: string | null;
  onTransition: (s: TripStatus) => void;
  onAssignDriver: (id: string) => void;
  onAssignVehicle: (id: string) => void;
  onConfirmPresence: (id: string) => void;
  onConfirmPayment: (paymentId: string) => void;
  onCancelBooking: (id: string) => Promise<void>;
};

export function AdminTripDetailView({
  role,
  trip,
  passengers,
  bookings,
  drivers,
  vehicles,
  paymentsByBookingId,
  transitioning,
  assigningDriver,
  assigningVehicle,
  busyBookingId,
  onTransition,
  onAssignDriver,
  onAssignVehicle,
  onConfirmPresence,
  onConfirmPayment,
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
  const depValid = !Number.isNaN(dep.getTime());
  const date = depValid ? `${pad(getBrDayOfMonth(dep))}/${pad(getBrMonth(dep))}` : "—";
  const time = depValid ? `${pad(getBrHour(dep))}:${pad(getBrMinute(dep))}` : "";
  const dateLong = depValid ? formatBrDateLong(dep) : "";
  const arr = trip.arrivalEstimate ? new Date(trip.arrivalEstimate) : null;
  const arrival =
    arr && !Number.isNaN(arr.getTime())
      ? `${pad(getBrHour(arr))}:${pad(getBrMinute(arr))}`
      : undefined;

  const hasSticky = transitions.length > 0;

  return (
    <div className={cn("flex flex-col gap-3.5", hasSticky && "pb-24")}>
      {/* Hero card */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
              {dateLong}
            </div>
            <div className="mt-0.5 font-mono text-[36px] font-extrabold leading-none tracking-[-1.5px] text-ink">
              {time}
            </div>
            {arrival && (
              <div className="mt-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                <Clock className="h-[11px] w-[11px]" strokeWidth={1.8} />
                Chega às <span className="font-mono font-bold text-ink-2">{arrival}</span>
              </div>
            )}
          </div>
          <StatusPill status={trip.tripStatus} />
        </div>

        {/* Timeline (paradas) */}
        <Timeline from={origin} to={destination} departure={time} arrival={arrival} stops={stops} />

        {/* Ocupação */}
        <div className="mt-3.5 flex items-center gap-3 border-t border-dashed border-line pt-3.5">
          <Users className="h-4 w-4 text-ink-2" strokeWidth={1.7} />
          <div className="flex-1">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[12px] font-semibold text-muted-foreground">Ocupação</span>
              <span className="font-mono text-[12px] font-bold text-ink">
                {trip.bookedCount ?? 0}
                <span className="font-medium text-muted-foreground">
                  {" "}
                  / {trip.totalCapacity ?? 0} lugares
                </span>
              </span>
            </div>
            <OccupancyBar booked={trip.bookedCount ?? 0} total={trip.totalCapacity ?? 0} />
          </div>
        </div>
      </div>

      {/* Motorista */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <SectionLabel icon={User}>Motorista</SectionLabel>

        {assignedDriver && !editingDriver ? (
          <div className="flex items-center gap-3 pt-2.5 pb-1">
            <DriverAvatar driver={assignedDriver} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="truncate text-[15px] font-extrabold tracking-[-0.2px] text-ink">
                  <DriverDisplayName driver={assignedDriver} />
                </div>
                {assignedDriver.driverStatus === "ACTIVE" ? (
                  <span className="inline-flex flex-none items-center gap-1 rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-bold tracking-[0.2px] text-success">
                    <span className="h-[5px] w-[5px] rounded-full bg-success" />
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex flex-none items-center rounded-full bg-line-soft px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {DRIVER_STATUS_LABEL[assignedDriver.driverStatus]}
                  </span>
                )}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                CNH {assignedDriver.cnh} · Cat. {assignedDriver.cnhCategories.join(", ")} · Val.{" "}
                {formatDateOnly(assignedDriver.cnhExpiresAt)}
              </div>
            </div>
            {canEdit && (
              <button
                onClick={() => setEditingDriver(true)}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-line bg-surface text-muted-foreground transition hover:bg-surface-2 hover:text-ink-2"
                aria-label="Trocar motorista"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            )}
          </div>
        ) : canEdit ? (
          <div className="space-y-2 pt-1">
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
          <div className="pt-2 text-[12px] text-muted-foreground">Sem motorista atribuído.</div>
        )}
      </div>

      {/* Veículo */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <SectionLabel icon={Bus}>Veículo</SectionLabel>

        {assignedVehicle && !editingVehicle ? (
          <div className="flex items-center gap-3 pt-2.5 pb-1">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#fef3c7] text-[#92580a]">
              <Bus className="h-[20px] w-[20px]" strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-extrabold tracking-[-0.2px] text-ink">
                {assignedVehicle.model}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded bg-line-soft px-1.5 py-0.5 font-mono font-bold tracking-[0.5px] text-ink-2">
                  {assignedVehicle.plate}
                </span>
                <span>{assignedVehicle.maxCapacity} assentos</span>
              </div>
            </div>
            {canEdit && (
              <button
                onClick={() => setEditingVehicle(true)}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-line bg-surface text-muted-foreground transition hover:bg-surface-2 hover:text-ink-2"
                aria-label="Trocar veículo"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            )}
          </div>
        ) : canEdit ? (
          <div className="space-y-2 pt-1">
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
          <div className="pt-2 text-[12px] text-muted-foreground">Sem veículo atribuído.</div>
        )}
      </div>

      {/* Inscrições */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <SectionLabel icon={Ticket}>Inscrições</SectionLabel>
          <span className="font-mono text-[11px] font-bold text-muted-foreground">
            {bookings.length} / {trip.totalCapacity ?? 0}
          </span>
        </div>
        {bookings.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-line bg-surface-2 px-4 py-5 text-center">
            <Users className="mx-auto h-[22px] w-[22px] text-muted-foreground" strokeWidth={1.7} />
            <div className="mt-1.5 text-[13px] font-bold text-ink-2">Nenhum passageiro ainda</div>
            <div className="mt-0.5 text-[11px] leading-[1.4] text-muted-foreground">
              Compartilhe o link público pra começar a receber inscrições.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => {
              // Trip cancelada bloqueia confirmar pagamento e cancelar inscrição —
              // o backend já marca todos os payments como FAILED quando a viagem é
              // cancelada, e a inscrição perde o sentido.
              const tripCanceled = trip.tripStatus === "CANCELED";
              return (
                <BookingRow
                  key={b.id}
                  booking={b}
                  passengerName={namesByUserId.get(b.userId)}
                  payment={paymentsByBookingId.get(b.id) ?? null}
                  onConfirmPresence={onConfirmPresence}
                  onConfirmPayment={tripCanceled ? undefined : onConfirmPayment}
                  onCancel={
                    !tripCanceled && isAdmin
                      ? (id) => {
                          const target = bookings.find((x) => x.id === id);
                          if (target) setCancelBooking(target);
                        }
                      : undefined
                  }
                  busy={busyBookingId === b.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      {hasSticky && (
        <div className="fixed inset-x-0 bottom-[60px] z-10 border-t border-line bg-surface px-4 py-2.5 pb-3">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            {transitions.includes("CANCELED") && (
              <button
                onClick={() => setCancelDialog(true)}
                disabled={transitioning}
                className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-xl border border-danger-soft bg-surface text-danger transition hover:bg-danger-soft disabled:opacity-50"
                aria-label="Cancelar viagem"
              >
                <XIcon className="h-[18px] w-[18px]" strokeWidth={2} />
              </button>
            )}
            {nonCancelTransitions[0] && (
              <button
                onClick={() => onTransition(nonCancelTransitions[0]!)}
                disabled={transitioning}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" strokeWidth={2.4} />
                {transitioning ? "Atualizando..." : STATUS_ACTION_LABEL[nonCancelTransitions[0]!]}
              </button>
            )}
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
