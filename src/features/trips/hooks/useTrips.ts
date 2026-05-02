import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import type { TripInstance } from "@/lib/types";

interface UseTripsOptions {
  orgId: string;
  slug?: string;
}

export function useTrips({ orgId, slug }: UseTripsOptions) {
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetch = slug ? tripsService.listBySlug(slug) : tripsService.listByOrgId(orgId);

    fetch
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
        setError(err.message);
        toast.error(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, slug, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { trips, loading: trips === null && !error, error, refetch };
}
