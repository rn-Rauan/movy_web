import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";
import type { TripInstance, BookingAvailability } from "@/lib/types";

export function useTripDetail(tripId: string) {
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    tripsService
      .getPublicById(tripId)
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
  }, [tripId]);

  return { trip, availability, loading: trip === null && !error, error };
}
