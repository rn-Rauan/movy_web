import { useEffect, useState } from "react";
import { tripsService } from "@/services/trips.service";
import { handleApiError } from "@/lib/handle-error";
import type { TripInstance, TripStatus } from "@/lib/types";

export function useDriverTrips(status?: TripStatus) {
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    tripsService
      .listForDriver(1, 50, status)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        const sorted = [...list].sort(
          (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
        );
        setTrips(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar viagens");
        handleApiError(err, "Erro ao carregar viagens");
      });

    return () => {
      cancelled = true;
    };
  }, [status, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { trips, loading: trips === null && !error, error, refetch };
}
