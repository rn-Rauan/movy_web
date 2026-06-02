import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import { isInDateRange, type DateRange } from "@/lib/date-filters";
import { getBrHour } from "@/lib/timezone";
import type { TripInstance, Paginated } from "@/lib/types";

type PublicTrip = TripInstance & { organizationName?: string; organizationSlug?: string };

export type Shift = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";
export type SortBy = "DEPARTURE_ASC" | "DEPARTURE_DESC" | "PRICE_ASC" | "PRICE_DESC";
export type { DateRange };

function shiftOf(iso: string): Exclude<Shift, "ALL"> {
  const h = getBrHour(iso);
  if (h < 12) return "MORNING";
  if (h < 18) return "AFTERNOON";
  return "EVENING";
}

function priceOf(t: PublicTrip): number {
  return t.priceOneWay ?? t.priceRoundTrip ?? t.priceReturn ?? Number.POSITIVE_INFINITY;
}

/** A rota (template) ou, na falta dele, a própria instância — chave de agrupamento. */
function routeKeyOf(t: PublicTrip): string {
  return t.tripTemplateId ?? t.id;
}

export type TripGroup = { trip: PublicTrip; extraDatesCount: number };

/**
 * Agrupa instâncias da mesma rota (template recorrente gera uma por dia). Mantém só a
 * próxima saída como representante e conta as demais datas, evitando poluir a lista.
 */
export function groupByRoute(list: PublicTrip[]): TripGroup[] {
  const map = new Map<string, PublicTrip[]>();
  for (const t of list) {
    const key = routeKeyOf(t);
    const arr = map.get(key);
    if (arr) arr.push(t);
    else map.set(key, [t]);
  }
  return [...map.values()].map((instances) => {
    const byDate = [...instances].sort(
      (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
    );
    return { trip: byDate[0], extraDatesCount: byDate.length - 1 };
  });
}

export function usePublicTrips() {
  const [trips, setTrips] = useState<PublicTrip[] | null>(null);
  const [search, setSearch] = useState("");
  const [shift, setShift] = useState<Shift>("ALL");
  const [dateRange, setDateRange] = useState<DateRange>("ANY");
  const [sortBy, setSortBy] = useState<SortBy>("DEPARTURE_ASC");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (tripsService.listPublic({ limit: 50 }) as Promise<Paginated<PublicTrip>>)
      .then((res) => setTrips(Array.isArray(res) ? res : (res.data ?? [])))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, []);

  const grouped = useMemo(() => {
    const list = trips ?? [];
    const q = search.trim().toLowerCase();

    const filteredList = list.filter((t) => {
      if (q) {
        const matchesText =
          t.departurePoint?.toLowerCase().includes(q) ||
          t.destination?.toLowerCase().includes(q) ||
          t.organizationName?.toLowerCase().includes(q);
        if (!matchesText) return false;
      }
      if (shift !== "ALL" && shiftOf(t.departureTime) !== shift) return false;
      if (!isInDateRange(t.departureTime, dateRange)) return false;
      return true;
    });

    // Agrupa por rota (representante = próxima saída) antes de ordenar os grupos.
    const groups = groupByRoute(filteredList);

    return groups.sort((ga, gb) => {
      const a = ga.trip;
      const b = gb.trip;
      switch (sortBy) {
        case "DEPARTURE_DESC":
          return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
        case "PRICE_ASC":
          return priceOf(a) - priceOf(b);
        case "PRICE_DESC":
          return priceOf(b) - priceOf(a);
        case "DEPARTURE_ASC":
        default:
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      }
    });
  }, [trips, search, shift, dateRange, sortBy]);

  function resetFilters() {
    setSearch("");
    setShift("ALL");
    setDateRange("ANY");
    setSortBy("DEPARTURE_ASC");
  }

  const hasActiveFilters =
    search.trim() !== "" || shift !== "ALL" || dateRange !== "ANY" || sortBy !== "DEPARTURE_ASC";

  return {
    trips,
    grouped,
    search,
    setSearch,
    shift,
    setShift,
    dateRange,
    setDateRange,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    error,
    loading: trips === null && !error,
  };
}

export type { PublicTrip };
