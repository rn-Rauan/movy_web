import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";
import { apiErrorMessage, bookingCancelErrorMessage } from "@/lib/handle-error";
import type { BookingDetails } from "@/lib/types";

export function useBookingDetail(bookingId: string) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const reload = useCallback(() => {
    bookingsService
      .getDetails(bookingId)
      .then(setBooking)
      .catch((err) => {
        setError(apiErrorMessage(err, "Erro ao carregar inscrição"));
      });
  }, [bookingId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function cancel() {
    setCancelError(null);
    setCancelling(true);
    try {
      await bookingsService.cancel(bookingId);
      toast.success("Inscrição cancelada.");
      reload();
    } catch (err) {
      setCancelError(bookingCancelErrorMessage(err, "Falha ao cancelar"));
    } finally {
      setCancelling(false);
    }
  }

  return { booking, loading: booking === null && !error, error, cancel, cancelling, cancelError };
}
