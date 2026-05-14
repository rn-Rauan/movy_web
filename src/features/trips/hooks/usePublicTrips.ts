import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import type { TripInstance, Paginated } from "@/lib/types";

type PublicTrip = TripInstance & { organizationName?: string; organizationSlug?: string };

export type Shift = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";
export type DateRange = "ANY" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "NEXT_WEEK";
export type SortBy = "DEPARTURE_ASC" | "DEPARTURE_DESC" | "PRICE_ASC" | "PRICE_DESC";

function shiftOf(iso: string): Exclude<Shift, "ALL"> {
  const h = new Date(iso).getHours();
  if (h < 12) return "MORNING";
  if (h < 18) return "AFTERNOON";
  return "EVENING";
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function dateRangeBounds(range: DateRange): { from: Date; to: Date } | null {
  if (range === "ANY") return null;
  const now = new Date();
  const today = startOfDay(now);
  if (range === "TODAY") {
    const to = new Date(today);
    to.setDate(to.getDate() + 1);
    return { from: today, to };
  }
  if (range === "TOMORROW") {
    const from = new Date(today);
    from.setDate(from.getDate() + 1);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from, to };
  }
  // Semana = domingo a sábado (locale BR usa segunda; ambos funcionam, escolhi domingo pra simplicidade)
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  if (range === "THIS_WEEK") {
    const to = new Date(weekStart);
    to.setDate(to.getDate() + 7);
    return { from: today, to };
  }
  // NEXT_WEEK
  const from = new Date(weekStart);
  from.setDate(from.getDate() + 7);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  return { from, to };
}

function priceOf(t: PublicTrip): number {
  return t.priceOneWay ?? t.priceRoundTrip ?? t.priceReturn ?? Number.POSITIVE_INFINITY;
}

export function usePublicTrips() {
  const [trips, setTrips] = useState<PublicTrip[] | null>(null);
  const [search, setSearch] = useState("");
  const [shift, setShift] = useState<Shift>("ALL");
  const [dateRange, setDateRange] = useState<DateRange>("ANY");
  const [sortBy, setSortBy] = useState<SortBy>("DEPARTURE_ASC");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (tripsService.listPublic() as Promise<Paginated<PublicTrip>>)
      .then((res) => setTrips(Array.isArray(res) ? res : (res.data ?? [])))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, []);

  const filtered = useMemo(() => {
    const list = trips ?? [];
    const q = search.trim().toLowerCase();
    const bounds = dateRangeBounds(dateRange);

    const filteredList = list.filter((t) => {
      if (q) {
        const matchesText =
          t.departurePoint?.toLowerCase().includes(q) ||
          t.destination?.toLowerCase().includes(q) ||
          t.organizationName?.toLowerCase().includes(q);
        if (!matchesText) return false;
      }
      if (shift !== "ALL" && shiftOf(t.departureTime) !== shift) return false;
      if (bounds) {
        const departure = new Date(t.departureTime);
        if (departure < bounds.from || departure >= bounds.to) return false;
      }
      return true;
    });

    const sorted = [...filteredList].sort((a, b) => {
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

    return sorted;
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
    filtered,
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
