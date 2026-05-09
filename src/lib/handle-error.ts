import { toast } from "sonner";
import { ApiError } from "./api";

function isPlanLimit403(err: ApiError): boolean {
  if (err.status !== 403) return false;
  if (err.errorCode) {
    return /PLAN.*LIMIT|LIMIT.*PLAN|NO_ACTIVE_SUBSCRIPTION/i.test(err.errorCode);
  }
  const msg = String(err.message ?? "").toLowerCase();
  return msg.includes("plan") || msg.includes("limit") || msg.includes("excedido");
}

const BOOKING_CANCEL_MESSAGES: Record<string, string> = {
  BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST:
    "Cancelamento bloqueado: faltam menos de 30 minutos para a partida.",
  BOOKING_TRIP_TERMINAL_BAD_REQUEST:
    "Esta viagem já começou — inscrições não podem mais ser canceladas.",
  BOOKING_ALREADY_INACTIVE_BAD_REQUEST: "Esta inscrição já foi cancelada.",
};

/**
 * Map a booking-cancel error to user-facing copy. Prefers the stable `errorCode` from the
 * backend (see API_FRONTEND.md → Booking Cancellation Error Codes); falls back to `err.message`.
 */
export function bookingCancelErrorMessage(
  err: unknown,
  fallback = "Erro ao cancelar inscrição",
): string {
  if (err instanceof ApiError && err.errorCode && BOOKING_CANCEL_MESSAGES[err.errorCode]) {
    return BOOKING_CANCEL_MESSAGES[err.errorCode];
  }
  return err instanceof Error ? err.message : fallback;
}

export function handleApiError(err: unknown, fallbackMsg: string) {
  if (err instanceof ApiError && isPlanLimit403(err)) {
    toast.error("Você atingiu o limite do seu plano", {
      action: {
        label: "Ver planos",
        onClick: () => window.location.assign("/organization"),
      },
    });
    return;
  }
  toast.error(err instanceof Error ? err.message : fallbackMsg);
}
