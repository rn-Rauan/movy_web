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
