import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { bookingsService } from "@/services/bookings.service";
import type { BookingAvailability } from "@/lib/types";

/**
 * Ocupação real por viagem para a lista pública. O endpoint `/public/trip-instances` não traz
 * `availableSlots`/`bookedCount` — só `GET /bookings/availability/{id}` (JWT) tem. Por isso só
 * buscamos quando o usuário está logado; deslogado a barra cai no fallback "Até N lugares".
 * Como o marketplace agrupa por rota, a lista de ids é pequena (~1 por rota).
 */
export function useTripsAvailability(tripIds: string[]): Map<string, BookingAvailability> {
  const { isAuthenticated } = useAuth();
  const [map, setMap] = useState<Map<string, BookingAvailability>>(new Map());
  const key = tripIds.join(",");

  useEffect(() => {
    if (!isAuthenticated || tripIds.length === 0) {
      setMap(new Map());
      return;
    }
    let cancelled = false;
    Promise.allSettled(
      tripIds.map((id) => bookingsService.checkAvailability(id).then((res) => [id, res] as const)),
    ).then((results) => {
      if (cancelled) return;
      const next = new Map<string, BookingAvailability>();
      for (const r of results) {
        if (r.status === "fulfilled") next.set(r.value[0], r.value[1]);
      }
      setMap(next);
    });
    return () => {
      cancelled = true;
    };
    // `key` representa o conjunto de ids; evita refetch quando a referência muda mas o conteúdo não.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isAuthenticated]);

  return map;
}
