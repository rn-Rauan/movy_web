import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";
import type { TripInstance, BookingAvailability } from "@/lib/types";

type Options = {
  /** When true, fetch via JWT-protected /trip-instances/{id} (enriched with template,
   *  bookedCount, availableSlots). Default false uses the public /public/trip-instances/{id}. */
  authenticated?: boolean;
};

export function useTripDetail(tripId: string, opts: Options = {}) {
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authenticated = false } = opts;

  useEffect(() => {
    let cancelled = false;

    const fetchTrip = authenticated
      ? tripsService.getById(tripId)
      : tripsService.getPublicById(tripId);

    fetchTrip
      .then((res) => {
        if (!cancelled) setTrip(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          toast.error(err.message);
        }
      });

    bookingsService
      .checkAvailability(tripId)
      .then((res) => {
        if (!cancelled) setAvailability(res);
      })
      .catch(() => {
        /* availability é opcional */
      });

    return () => {
      cancelled = true;
    };
  }, [tripId, authenticated]);

  return { trip, availability, loading: trip === null && !error, error };
}
