import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { bookingsService } from "@/services/bookings.service";
import { apiErrorMessage, zodFieldErrors } from "@/lib/handle-error";
import { canEnroll } from "@/lib/format";
import type { TripInstance, EnrollmentType, PaymentMethod } from "@/lib/types";

const schema = z
  .object({
    enrollmentType: z.enum(["ONE_WAY", "RETURN", "ROUND_TRIP"]),
    boardingStop: z.string().trim().min(1, "Selecione a parada de embarque"),
    alightingStop: z.string().trim().min(1, "Selecione a parada de desembarque"),
    method: z.enum(["MONEY", "PIX", "CREDIT_CARD", "DEBIT_CARD"]),
  })
  .refine((d) => d.boardingStop !== d.alightingStop, {
    message: "Embarque e desembarque devem ser diferentes",
    path: ["alightingStop"],
  });

export function useBookingForm(tripId: string) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    enrollmentType: "ONE_WAY" as EnrollmentType,
    boardingStop: "",
    alightingStop: "",
    method: "PIX" as PaymentMethod,
  });

  const prefill = useCallback((trip: TripInstance) => {
    setForm((f) => ({
      ...f,
      boardingStop: f.boardingStop || trip.departurePoint || "",
      alightingStop: f.alightingStop || trip.destination || "",
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  async function submit(trip: TripInstance | null) {
    setError(null);
    setFieldErrors({});
    if (trip && !canEnroll(trip.tripStatus)) {
      setError("Esta viagem não aceita inscrições no momento.");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setSubmitting(true);
    try {
      const created = (await bookingsService.create({
        tripInstanceId: tripId,
        ...parsed.data,
      })) as { id?: string } | undefined;
      toast.success("Inscrição realizada!");
      const newId = created?.id;
      if (newId) {
        navigate({ to: "/bookings-success/$bookingId", params: { bookingId: newId } });
      } else {
        navigate({ to: "/my-bookings" });
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Falha na inscrição"));
    } finally {
      setSubmitting(false);
    }
  }

  return { form, setForm, prefill, submit, submitting, error, fieldErrors, clearErrors };
}
