import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";
import type { BookingDetails } from "@/lib/types";

export function useBookingDetail(bookingId: string) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const reload = useCallback(() => {
    bookingsService
      .getDetails(bookingId)
      .then(setBooking)
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, [bookingId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function cancel() {
    setCancelling(true);
    try {
      await bookingsService.cancel(bookingId);
      toast.success("Inscrição cancelada.");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cancelar");
    } finally {
      setCancelling(false);
    }
  }

  return { booking, loading: booking === null && !error, error, cancel, cancelling };
}
