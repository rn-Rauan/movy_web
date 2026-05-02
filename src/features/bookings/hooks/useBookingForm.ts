import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { bookingsService } from "@/services/bookings.service";
import { canEnroll } from "@/lib/format";
import type { TripInstance, EnrollmentType, PaymentMethod } from "@/lib/types";

const schema = z.object({
  enrollmentType: z.enum(["ONE_WAY", "RETURN", "ROUND_TRIP"]),
  boardingStop: z.string().trim().min(1, "Informe a parada de embarque"),
  alightingStop: z.string().trim().min(1, "Informe a parada de desembarque"),
  method: z.enum(["MONEY", "PIX", "CREDIT_CARD", "DEBIT_CARD"]),
});

export function useBookingForm(tripId: string) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
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

  async function submit(trip: TripInstance | null) {
    if (trip && !canEnroll(trip.tripStatus)) {
      toast.error("Esta viagem não aceita inscrições no momento.");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await bookingsService.create({ tripInstanceId: tripId, ...parsed.data });
      toast.success("Inscrição realizada!");
      navigate({ to: "/_protected/my-bookings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na inscrição");
    } finally {
      setSubmitting(false);
    }
  }

  return { form, setForm, prefill, submit, submitting };
}
