import { toast } from "sonner";
import type { ZodError } from "zod";
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

// 400 do fluxo de criação de inscrição (distinto do cancelamento acima).
const BOOKING_MESSAGES: Record<string, string> = {
  BOOKING_TRIP_INSTANCE_NOT_BOOKABLE_BAD_REQUEST: "Esta viagem não está disponível para inscrição.",
  BOOKING_STOP_BAD_REQUEST: "Selecione pontos de embarque e desembarque válidos.",
  BOOKING_PRICE_NOT_AVAILABLE_BAD_REQUEST: "O preço desta viagem ainda não está disponível.",
  BOOKING_CREATION_FAILED_BAD_REQUEST: "Não foi possível concluir a inscrição. Tente novamente.",
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
  TRIP_INSTANCE_STATUS_TRANSITION_BAD_REQUEST: "Transição de status inválida para esta viagem.",
  TRIP_INSTANCE_CAPACITY_BAD_REQUEST: "Capacidade da viagem inválida.",
  TRIP_INSTANCE_TIMES_BAD_REQUEST: "Os horários da viagem estão inconsistentes.",
  TRIP_INSTANCE_CREATION_FAILED_BAD_REQUEST: "Não foi possível criar a viagem. Verifique os dados.",
  TRIP_TEMPLATE_INACTIVE: "Este template de rota está inativo.",
  INVALID_TRIP_STOPS: "Paradas inválidas. Verifique os pontos informados.",
  INVALID_TRIP_ROUTE_POINTS: "Pontos de origem e destino inválidos.",
  INVALID_TRIP_PRICE_CONFIGURATION: "Configuração de preço inválida.",
  INVALID_SCHEDULING_DAYS_AHEAD: "A janela de geração deve estar entre 1 e 90 dias.",
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
  DRIVER_PROFILE_NOT_FOUND_BAD_REQUEST: "Você ainda não tem perfil de motorista.",
  DRIVER_NOT_FOUND_FOR_MEMBERSHIP_BAD_REQUEST:
    "Este usuário ainda não ativou o perfil de motorista.",
  USER_FOR_MEMBERSHIP_NOT_FOUND: "Nenhum usuário encontrado com esse e-mail.",
  EXPIRED_CNH: "A CNH informada está vencida.",
  INVALID_CNH: "Número de CNH inválido.",
  INVALID_CNH_EXPIRATION: "Data de validade da CNH inválida.",
  VEHICLE_INACTIVE: "Este veículo está inativo.",
  INVALID_PLATE: "Placa inválida.",
  INVALID_CNPJ: "CNPJ inválido.",
  INVALID_PASSWORD: "A senha não atende aos requisitos mínimos.",
};

// 409 Conflict — recursos duplicados/indisponíveis. Sem estes mapeamentos, os códigos caem
// no conflictMessage genérico (pensado para signup/organização) e viram "E-mail ou slug já
// cadastrado". Ver Catálogo de Erros da API (campo `error` do payload).
const CONFLICT_MESSAGES: Record<string, string> = {
  DRIVER_CNH_ALREADY_EXISTS: "Já existe um motorista cadastrado com essa CNH.",
  DRIVER_ALREADY_EXISTS_CONFLICT: "Você já possui um perfil de motorista.",
  PLATE_ALREADY_IN_USE: "Já existe um veículo cadastrado com essa placa.",
  BOOKING_ALREADY_EXISTS_CONFLICT: "Você já está inscrito nesta viagem.",
  BOOKING_TRIP_INSTANCE_FULL_CONFLICT: "Esta viagem está lotada.",
  SUBSCRIPTION_ALREADY_EXISTS: "Esta organização já possui uma assinatura ativa.",
  MEMBERSHIP_ALREADY_EXISTS: "Este vínculo já existe.",
  USER_EMAIL_ALREADY_EXISTS: "Já existe uma conta com esse e-mail.",
  ORGANIZATION_ALREADY_EXISTS: "Já existe uma organização com esse CNPJ.",
  ORGANIZATION_EMAIL_ALREADY_EXISTS: "Já existe uma organização com esse e-mail.",
  ORGANIZATION_SLUG_ALREADY_EXISTS: "Esse identificador (slug) já está em uso.",
};

export const PLAN_LIMIT_MESSAGE = "Você atingiu o limite do seu plano";

/** True when the error is a 403 caused by a plan limit / missing subscription. */
export function isPlanLimitError(err: unknown): boolean {
  return err instanceof ApiError && isPlanLimit403(err);
}

/**
 * Map a booking-cancel error to user-facing copy. Prefers the stable `errorCode` from the
 * backend (see API_FRONTEND.md → Booking Cancellation Error Codes). Nunca expõe a mensagem
 * crua do backend (vem em inglês) — cai no `fallback` em português.
 */
export function bookingCancelErrorMessage(
  err: unknown,
  fallback = "Erro ao cancelar inscrição",
): string {
  if (err instanceof ApiError && err.errorCode && BOOKING_CANCEL_MESSAGES[err.errorCode]) {
    return BOOKING_CANCEL_MESSAGES[err.errorCode];
  }
  return fallback;
}

/**
 * Mensagem de falha de login. Para **não revelar se a conta existe** (anti-enumeração), todas
 * as falhas de credencial — senha errada (401), e-mail inexistente (404), payload inválido (400) —
 * mostram a MESMA mensagem. Só erros de servidor/conexão recebem cópia distinta.
 */
export function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError && [400, 401, 404].includes(err.status)) {
    return "E-mail ou senha incorretos.";
  }
  return "Não foi possível entrar. Verifique sua conexão e tente novamente.";
}

/** All errorCode → PT-BR maps, searched in order. */
function mappedErrorCode(errorCode: string | null): string | undefined {
  if (!errorCode) return undefined;
  return (
    BOOKING_CANCEL_MESSAGES[errorCode] ??
    BOOKING_MESSAGES[errorCode] ??
    TRIP_SCHEDULING_MESSAGES[errorCode] ??
    DRIVER_AND_AUTH_MESSAGES[errorCode] ??
    CONFLICT_MESSAGES[errorCode]
  );
}

/** Copy for a 409 conflict (signup / register-organization) — slug vs e-mail heuristic. */
function conflictMessage(err: ApiError): string {
  const raw = String(
    (err.data as { message?: string } | null)?.message ?? err.message ?? "",
  ).toLowerCase();
  if (raw.includes("slug")) return "Esse slug já está em uso, escolha outro.";
  if (raw.includes("email") || raw.includes("e-mail") || raw.includes("user")) {
    return "Já existe uma conta com esse e-mail.";
  }
  return "E-mail ou slug já cadastrado.";
}

/**
 * Resolve an error to user-facing PT-BR copy **without** showing a toast. This is the single
 * source of truth for error text — feed the result into an inline `<FormError>` / `ErrorCard`,
 * or into `handleApiError` (which just wraps this in a toast). Prefers the stable `errorCode`;
 * adds auth fallbacks (login 401, signup/org 409) that have no dedicated errorCode.
 *
 * **Nunca retorna a mensagem crua do backend** — ela costuma vir em inglês e pode vazar detalhes
 * (ex.: "User with id ... not found"). Quando não há mapeamento, usa o `fallback` (sempre em PT).
 */
export function apiErrorMessage(
  err: unknown,
  fallback = "Algo deu errado. Tente novamente.",
): string {
  if (err instanceof ApiError) {
    if (isPlanLimit403(err)) return PLAN_LIMIT_MESSAGE;
    const mapped = mappedErrorCode(err.errorCode);
    if (mapped) return mapped;
    if (err.status === 401) return "E-mail ou senha incorretos.";
    if (err.status === 409) return conflictMessage(err);
  }
  return fallback;
}

/** Convert a ZodError into a `{ "path.to.field": message }` map for inline rendering. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const errs: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = issue.path.join(".");
    if (!errs[key]) errs[key] = issue.message;
  });
  return errs;
}

export function handleApiError(err: unknown, fallbackMsg: string) {
  if (isPlanLimitError(err)) {
    toast.error(PLAN_LIMIT_MESSAGE, {
      action: {
        label: "Ver planos",
        onClick: () => window.location.assign("/organization"),
      },
    });
    return;
  }
  toast.error(apiErrorMessage(err, fallbackMsg));
}
