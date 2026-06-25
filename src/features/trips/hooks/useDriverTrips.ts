import { useEffect, useState } from "react";
import { tripsService } from "@/services/trips.service";
import { fetchAllPages } from "@/lib/paginate";
import { apiErrorMessage } from "@/lib/handle-error";
import type { TripInstance, TripStatus } from "@/lib/types";

export function useDriverTrips(status?: TripStatus) {
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAllPages<TripInstance>((page, limit) => tripsService.listForDriver(page, limit, status))
      .then((list) => {
        if (cancelled) return;
        const sorted = [...list].sort(
          (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
        );
        setTrips(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err, "Erro ao carregar viagens"));
      });

    return () => {
      cancelled = true;
    };
  }, [status, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { trips, loading: trips === null && !error, error, refetch };
}
