import { useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "@/lib/handle-error";
import { bookingsService } from "@/services/bookings.service";
import type { Booking, BookingStatus } from "@/lib/types";

export type BookingStatusFilter = "ALL" | BookingStatus;

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL");

  useEffect(() => {
    bookingsService
      .listForUser()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setBookings(list);
      })
      .catch((err) => {
        setError(apiErrorMessage(err, "Erro ao carregar inscrições"));
      });
  }, []);

  const filtered = useMemo(() => {
    const list = bookings ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (q) {
        const matches =
          b.boardingStop?.toLowerCase().includes(q) ||
          b.alightingStop?.toLowerCase().includes(q) ||
          b.tripInstance?.departurePoint?.toLowerCase().includes(q) ||
          b.tripInstance?.destination?.toLowerCase().includes(q) ||
          b.tripInstance?.organizationName?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter]);

  function resetFilters() {
    setSearch("");
    setStatusFilter("ALL");
  }

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "ALL";

  return {
    bookings,
    filtered,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    resetFilters,
    hasActiveFilters,
    loading: bookings === null && !error,
    error,
  };
}
