import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import type { TripInstance, Paginated } from "@/lib/types";

type PublicTrip = TripInstance & { organizationName?: string; organizationSlug?: string };

export function usePublicTrips() {
  const [trips, setTrips] = useState<PublicTrip[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (tripsService.listPublic() as Promise<Paginated<PublicTrip>>)
      .then((res) => setTrips(Array.isArray(res) ? res : (res.data ?? [])))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, []);

  const filtered = (trips ?? []).filter((t) => {
    const q = search.toLowerCase();
    return (
      !q || t.departurePoint?.toLowerCase().includes(q) || t.destination?.toLowerCase().includes(q)
    );
  });

  return {
    trips,
    filtered,
    search,
    setSearch,
    error,
    loading: trips === null && !error,
  };
}

export type { PublicTrip };
