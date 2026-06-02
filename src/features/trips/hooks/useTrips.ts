import { useEffect, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import type { Paginated, TripInstance } from "@/lib/types";

interface UseTripsOptions {
  orgId: string;
  slug?: string;
}

const PAGE_SIZE = 50;

function asList(res: TripInstance[] | Paginated<TripInstance>): TripInstance[] {
  return Array.isArray(res) ? res : (res.data ?? []);
}

/**
 * Busca todas as instâncias da org. O endpoint é paginado (default 10) e não filtra por status,
 * então precisamos varrer todas as páginas — senão o dashboard pode ver só viagens antigas
 * (FINISHED) e reportar "0 ativas". Vai com limit 50; busca as páginas restantes em paralelo.
 */
async function fetchAllByOrg(orgId: string): Promise<TripInstance[]> {
  const first = await tripsService.listByOrgId(orgId, 1, PAGE_SIZE);
  if (Array.isArray(first)) return first;
  const all = [...(first.data ?? [])];
  const totalPages = first.totalPages ?? 1;
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        tripsService.listByOrgId(orgId, i + 2, PAGE_SIZE),
      ),
    );
    for (const page of rest) all.push(...asList(page));
  }
  return all;
}

export function useTrips({ orgId, slug }: UseTripsOptions) {
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetch = slug ? tripsService.listBySlug(slug).then(asList) : fetchAllByOrg(orgId);

    fetch
      .then((list) => {
        if (cancelled) return;
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
