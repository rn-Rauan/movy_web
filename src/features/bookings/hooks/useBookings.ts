import { useEffect, useState } from "react";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";
import type { Booking } from "@/lib/types";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bookingsService
      .listForUser()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setBookings(list);
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, []);

  return { bookings, loading: bookings === null && !error, error };
}
