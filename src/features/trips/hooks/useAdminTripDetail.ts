import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";
import { driversService } from "@/services/drivers.service";
import { vehiclesService } from "@/services/vehicles.service";
import { paymentsService } from "@/services/payments.service";
import { ApiError } from "@/lib/api";
import { apiErrorMessage, bookingCancelErrorMessage } from "@/lib/handle-error";
import { statusLabel } from "@/lib/format";
import type {
  Booking,
  Driver,
  Paginated,
  Payment,
  TripInstance,
  TripPassenger,
  TripStatus,
  Vehicle,
} from "@/lib/types";

type Options = {
  /** "admin" loads drivers/vehicles for assignment; "driver" skips those lists. */
  role?: "admin" | "driver" | null;
};

/**
 * Stub para exibir apenas o nome de um motorista que NÃO é o próprio usuário.
 * `GET /drivers/{id}` é admin-only, então o driver não acessa CNH/categorias de colegas;
 * o nome é resolvido por `useDriverName` (GET /drivers/{id}/name) no componente.
 */
function nameOnlyDriver(id: string): Driver {
  return { id, userId: "", cnh: "", cnhCategories: [], cnhExpiresAt: "", driverStatus: "ACTIVE" };
}

export function useAdminTripDetail(
  tripId: string,
  orgId: string | null | undefined,
  options: Options = {},
) {
  const { role = "admin" } = options;
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [transitioning, setTransitioning] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [assigningVehicle, setAssigningVehicle] = useState(false);
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null);

  useEffect(() => {
    tripsService
      .getById(tripId)
      .then(setTrip)
      .catch((err) => setError(apiErrorMessage(err, "Erro ao carregar viagem")));
  }, [tripId]);

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
    if (!orgId || role !== "admin") return;
    driversService
      .listByOrgId(orgId)
      .then((res) => setDrivers(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
    vehiclesService
      .listByOrgId(orgId)
      .then((res) => setVehicles(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
  }, [orgId, role]);

  // Driver: as listas por org são admin-only, então resolvemos só o motorista e o
  // veículo atribuídos. O veículo vem de GET /vehicles/{id} (liberado pra driver da
  // própria org). Pro motorista, GET /drivers/{id} continua admin-only: se o atribuído
  // é o próprio user, mostramos os dados completos via /drivers/me; se for outro,
  // exibimos só o nome (resolvido via /drivers/{id}/name no componente) com um stub,
  // sem expor a CNH de colegas. Erros viram lista vazia (a UI mostra "sem atribuído").
  const driverId = trip?.driverId ?? null;
  const vehicleId = trip?.vehicleId ?? null;
  useEffect(() => {
    if (role !== "driver") return;
    let cancelled = false;

    (async () => {
      if (!driverId) {
        if (!cancelled) setDrivers([]);
        return;
      }
      try {
        const me = await driversService.getMe();
        if (!cancelled) setDrivers([me.id === driverId ? me : nameOnlyDriver(driverId)]);
      } catch {
        if (!cancelled) setDrivers([nameOnlyDriver(driverId)]);
      }
    })();

    (async () => {
      if (!vehicleId) {
        if (!cancelled) setVehicles([]);
        return;
      }
      try {
        const v = await vehiclesService.getById(vehicleId);
        if (!cancelled) setVehicles([v]);
      } catch {
        if (!cancelled) setVehicles([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, driverId, vehicleId]);

  // Carrega payments da org da própria trip (funciona pra admin e — quando o
  // backend liberar — pra driver). Silenciosamente ignora 403/404 enquanto a
  // permissão de driver ainda não estiver ativa.
  useEffect(() => {
    if (!trip?.organizationId || bookings.length === 0) return;
    let cancelled = false;
    const bookingIds = new Set(bookings.map((b) => b.id));

    (async () => {
      const out: Payment[] = [];
      const size = 100;
      try {
        for (let page = 1; page <= 20; page++) {
          const res = await paymentsService.list(trip.organizationId, page, size);
          const list = Array.isArray(res) ? res : (res.data ?? []);
          out.push(...list);
          const meta = !Array.isArray(res) ? (res as Paginated<Payment>) : null;
          if (!meta || list.length < size || (meta.totalPages && page >= meta.totalPages)) break;
        }
        if (cancelled) return;
        setPayments(out.filter((p) => p.enrollmentId && bookingIds.has(p.enrollmentId)));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          setPayments([]);
          return;
        }
        // Outros erros — silencioso (a tela não depende criticamente disso)
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trip?.organizationId, bookings]);

  const paymentsByBookingId = useMemo(() => {
    const m = new Map<string, Payment>();
    for (const p of payments) {
      if (!p.enrollmentId) continue;
      const existing = m.get(p.enrollmentId);
      // Mais recente vence se houver múltiplos (compara updatedAt ?? createdAt)
      const ts = (x: Payment) => new Date(x.updatedAt ?? x.createdAt).getTime();
      if (!existing || ts(p) > ts(existing)) m.set(p.enrollmentId, p);
    }
    return m;
  }, [payments]);

  async function transitionStatus(newStatus: TripStatus) {
    if (!trip) return;
    setActionError(null);
    setTransitioning(true);
    try {
      const updated = await tripsService.updateStatus(trip.id, newStatus);
      setTrip(updated);
      toast.success(`Viagem ${statusLabel(newStatus).toLowerCase()}`);
      if (newStatus === "CANCELED") navigate({ to: "/trips" });
    } catch (err) {
      setActionError(apiErrorMessage(err, "Erro ao atualizar status"));
    } finally {
      setTransitioning(false);
    }
  }

  async function assignDriver(driverId: string) {
    if (!trip) return;
    setActionError(null);
    setAssigningDriver(true);
    try {
      const updated = await tripsService.assignDriver(
        trip.id,
        driverId === "none" ? undefined : driverId,
      );
      setTrip(updated);
      toast.success("Motorista atualizado");
    } catch (err) {
      setActionError(apiErrorMessage(err, "Erro ao atribuir motorista"));
    } finally {
      setAssigningDriver(false);
    }
  }

  async function assignVehicle(vehicleId: string) {
    if (!trip) return;
    setActionError(null);
    setAssigningVehicle(true);
    try {
      const updated = await tripsService.assignVehicle(
        trip.id,
        vehicleId === "none" ? undefined : vehicleId,
      );
      setTrip(updated);
      toast.success("Veículo atualizado");
    } catch (err) {
      setActionError(apiErrorMessage(err, "Erro ao atribuir veículo"));
    } finally {
      setAssigningVehicle(false);
    }
  }

  async function confirmPresence(bookingId: string) {
    setActionError(null);
    setBusyBookingId(bookingId);
    try {
      const updated = await bookingsService.confirmPresence(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      toast.success("Presença confirmada");
    } catch (err) {
      setActionError(apiErrorMessage(err, "Erro ao confirmar presença"));
    } finally {
      setBusyBookingId(null);
    }
  }

  async function confirmPayment(paymentId: string) {
    if (!trip?.organizationId) return;
    setActionError(null);
    const targetBookingId = payments.find((p) => p.id === paymentId)?.enrollmentId ?? null;
    if (targetBookingId) setBusyBookingId(targetBookingId);
    try {
      await paymentsService.confirm(trip.organizationId, paymentId);
      // Busca o payment fresh do backend pra garantir status consistente (defensivo
      // contra o caso raro de o /confirm retornar 200 mas o status ainda vir PENDING).
      const fresh = await paymentsService.getById(trip.organizationId, paymentId);
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? fresh : p)));
      if (fresh.status === "COMPLETED") {
        toast.success("Pagamento confirmado");
      } else {
        toast.warning(`Pagamento ainda está como ${fresh.status} — verifique o relatório.`);
      }
    } catch (err) {
      setActionError(apiErrorMessage(err, "Erro ao confirmar pagamento"));
    } finally {
      setBusyBookingId(null);
    }
  }

  async function cancelBooking(bookingId: string) {
    setActionError(null);
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
      setActionError(bookingCancelErrorMessage(err));
    } finally {
      setBusyBookingId(null);
    }
  }

  return {
    trip,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    passengers,
    bookings,
    drivers,
    vehicles,
    paymentsByBookingId,
    transitioning,
    assigningDriver,
    assigningVehicle,
    busyBookingId,
    transitionStatus,
    assignDriver,
    assignVehicle,
    confirmPresence,
    confirmPayment,
    cancelBooking,
  };
}
