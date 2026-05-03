import { useEffect, useState } from "react";
import { tripsService } from "@/services/trips.service";
import type { TripPassenger } from "@/lib/types";

/** Fetch passenger names + boarding stops. Silently no-ops on 403 (no booking + not member). */
export function useTripPassengers(tripId: string) {
  const [passengers, setPassengers] = useState<TripPassenger[] | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    tripsService
      .listPassengers(tripId)
      .then((res) => {
        if (!cancelled) setPassengers(res ?? []);
      })
      .catch(() => {
        if (!cancelled) setForbidden(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  return { passengers, forbidden, loading: passengers === null && !forbidden };
}
