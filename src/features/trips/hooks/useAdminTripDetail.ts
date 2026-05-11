import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";
import { driversService } from "@/services/drivers.service";
import { vehiclesService } from "@/services/vehicles.service";
import { handleApiError, bookingCancelErrorMessage } from "@/lib/handle-error";
import { statusLabel } from "@/lib/format";
import type {
  Booking,
  Driver,
  Paginated,
  TripInstance,
  TripPassenger,
  TripStatus,
  Vehicle,
} from "@/lib/types";

export function useAdminTripDetail(tripId: string, orgId: string | null | undefined) {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [transitioning, setTransitioning] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [assigningVehicle, setAssigningVehicle] = useState(false);
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null);

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
    bookingsService
      .listByTripInstance(tripId)
      .then((res) =>
        setBookings(Array.isArray(res) ? res : ((res as Paginated<Booking>).data ?? [])),
      )
      .catch(() => {});
  }, [tripId, trip]);

  useEffect(() => {
    if (!orgId) return;
    driversService
      .listByOrgId(orgId)
      .then((res) => setDrivers(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
    vehiclesService
      .listByOrgId(orgId)
      .then((res) => setVehicles(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
  }, [orgId]);

  async function transitionStatus(newStatus: TripStatus) {
    if (!trip) return;
    setTransitioning(true);
    try {
      const updated = await tripsService.updateStatus(trip.id, newStatus);
      setTrip(updated);
      toast.success(`Viagem ${statusLabel(newStatus).toLowerCase()}`);
      if (newStatus === "CANCELED") navigate({ to: "/trips" });
    } catch (err) {
      handleApiError(err, "Erro ao atualizar status");
    } finally {
      setTransitioning(false);
    }
  }

  async function assignDriver(driverId: string) {
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
      handleApiError(err, "Erro ao atribuir motorista");
    } finally {
      setAssigningDriver(false);
    }
  }

  async function assignVehicle(vehicleId: string) {
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
      handleApiError(err, "Erro ao atribuir veículo");
    } finally {
      setAssigningVehicle(false);
    }
  }

  async function confirmPresence(bookingId: string) {
    setBusyBookingId(bookingId);
    try {
      const updated = await bookingsService.confirmPresence(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      toast.success("Presença confirmada");
    } catch (err) {
      handleApiError(err, "Erro ao confirmar presença");
    } finally {
      setBusyBookingId(null);
    }
  }

  async function cancelBooking(bookingId: string) {
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
      toast.error(bookingCancelErrorMessage(err));
    } finally {
      setBusyBookingId(null);
    }
  }

  return {
    trip,
    error,
    passengers,
    bookings,
    drivers,
    vehicles,
    transitioning,
    assigningDriver,
    assigningVehicle,
    busyBookingId,
    transitionStatus,
    assignDriver,
    assignVehicle,
    confirmPresence,
    cancelBooking,
  };
}