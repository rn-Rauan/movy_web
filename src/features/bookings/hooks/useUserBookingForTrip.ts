import { useEffect, useState } from "react";
import { bookingsService } from "@/services/bookings.service";
import type { Booking } from "@/lib/types";

/** Returns the user's existing ACTIVE booking for a given trip, if any. */
export function useUserBookingForTrip(tripId: string | undefined) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(tripId));

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    bookingsService
      .listForUser()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        const match =
          list.find((b) => b.tripInstanceId === tripId && b.status === "ACTIVE") ?? null;
        setBooking(match);
      })
      .catch(() => {
        if (!cancelled) setBooking(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  return { booking, loading };
}
