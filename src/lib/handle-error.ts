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

const TRIP_SCHEDULING_MESSAGES: Record<string, string> = {
  INVALID_TRIP_TIME_OF_DAY_FORMAT: "Use o formato HH:mm (24h) nos horários do template.",
  INVALID_TRIP_TIME_OF_DAY_ORDER: "Horários do template são inválidos.",
  INVALID_TRIP_TEMPLATE_DEFAULT_CAPACITY: "A capacidade padrão do template deve ser ao menos 1.",
  INVALID_TRIP_TEMPLATE_MISSING_SCHEDULE:
    "Configure os horários do template antes de criar viagens.",
  INVALID_TRIP_TEMPLATE_MISSING_CAPACITY:
    "Configure a capacidade padrão do template antes de gerar viagens.",
  TRIP_TEMPLATE_NOT_RECURRING_BAD_REQUEST:
    "A geração automática só funciona em templates recorrentes ativos.",
};

const DRIVER_AND_AUTH_MESSAGES: Record<string, string> = {
  DRIVER_NOT_FOUND_BAD_REQUEST: "Motorista não encontrado.",
  VEHICLE_NOT_FOUND: "Veículo não encontrado.",
  DRIVER_ACCESS_FORBIDDEN: "Esse motorista pertence a outra organização.",
  VEHICLE_ACCESS_FORBIDDEN: "Esse veículo pertence a outra organização.",
  TRIP_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN: "Você só pode atualizar viagens atribuídas a você.",
  DRIVER_TRIP_STATUS_TRANSITION_FORBIDDEN:
    "Motoristas só podem marcar viagens como em andamento ou finalizadas.",
  DRIVER_PROFILE_NOT_FOUND: "Você ainda não tem perfil de motorista.",
  DRIVER_INACTIVE_FORBIDDEN: "Seu perfil de motorista está inativo. Contate um administrador.",
  INVALID_CNH_CATEGORIES_BAD_REQUEST: "Selecione ao menos uma categoria de CNH válida.",
  INVALID_PARTIAL_CNH_UPDATE_BAD_REQUEST:
    "Para trocar a CNH, envie número, categorias e validade juntos.",
  PAYMENT_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN: "Este pagamento não está vinculado a uma viagem sua.",
  PAYMENT_ALREADY_PROCESSED_BAD_REQUEST: "Pagamento já foi processado.",
  INVALID_OR_EXPIRED_RESET_TOKEN_BAD_REQUEST: "Link de recuperação expirou. Solicite outro.",
  INVALID_OR_EXPIRED_VERIFICATION_TOKEN_BAD_REQUEST: "Link de verificação expirou. Solicite outro.",
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
  if (err instanceof ApiError) {
    if (isPlanLimit403(err)) {
      toast.error("Você atingiu o limite do seu plano", {
        action: {
          label: "Ver planos",
          onClick: () => window.location.assign("/organization"),
        },
      });
      return;
    }
    if (err.errorCode && TRIP_SCHEDULING_MESSAGES[err.errorCode]) {
      toast.error(TRIP_SCHEDULING_MESSAGES[err.errorCode]);
      return;
    }
    if (err.errorCode && DRIVER_AND_AUTH_MESSAGES[err.errorCode]) {
      toast.error(DRIVER_AND_AUTH_MESSAGES[err.errorCode]);
      return;
    }
  }
  toast.error(err instanceof Error ? err.message : fallbackMsg);
}
