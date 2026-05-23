import type { Payment, TripStatus } from "./types";
import { BR_TZ } from "./timezone";

/**
 * Data ISO usada pra agrupar receita por dia. Preferimos `tripDepartureTime`
 * (dia em que a viagem acontece) sobre `createdAt` (dia da inscrição) — assim
 * uma inscrição feita hoje numa viagem de amanhã conta na receita de amanhã.
 *
 * Enquanto o backend ainda não enriquece o PaymentResponse com `tripDepartureTime`,
 * caímos no `createdAt` como fallback.
 */
export function paymentBucketDate(p: Payment): string {
  return p.tripDepartureTime ?? p.createdAt;
}

export function formatDateTime(iso: string, timeOnly = false) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (timeOnly) {
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: BR_TZ,
    });
  }
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BR_TZ,
  });
}

export function formatFullDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: BR_TZ,
  });
}

/**
 * Formata uma data calendário ("YYYY-MM-DD" ou ISO com sufixo Z) como dd/MM/yyyy
 * SEM aplicar conversão de timezone — para campos que representam um dia civil
 * (ex.: `cnhExpiresAt`) e que não devem mudar entre fusos.
 */
export function formatDateOnly(input: string | null | undefined): string {
  if (!input) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (!m) return input;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

export function statusLabel(s: TripStatus | string): string {
  const map: Record<string, string> = {
    DRAFT: "Rascunho",
    SCHEDULED: "Agendada",
    CONFIRMED: "Confirmada",
    IN_PROGRESS: "Em curso",
    FINISHED: "Concluída",
    CANCELED: "Cancelada",
  };
  return map[s] ?? s;
}

export function statusVariant(
  s: TripStatus | string,
): "default" | "secondary" | "destructive" | "outline" {
  if (s === "CONFIRMED" || s === "IN_PROGRESS") return "default";
  if (s === "SCHEDULED") return "secondary";
  if (s === "CANCELED") return "destructive";
  return "outline";
}

export function canEnroll(s: TripStatus | string) {
  return s === "SCHEDULED" || s === "CONFIRMED";
}

export function bookingStatusLabel(s: string) {
  const map: Record<string, string> = {
    ACTIVE: "Ativa",
    INACTIVE: "Cancelada",
  };
  return map[s] ?? s;
}

export function enrollmentTypeLabel(t: string) {
  const map: Record<string, string> = {
    ONE_WAY: "Somente ida",
    RETURN: "Somente volta",
    ROUND_TRIP: "Ida e volta",
  };
  return map[t] ?? t;
}

export function paymentMethodLabel(m: string) {
  const map: Record<string, string> = {
    MONEY: "Dinheiro",
    PIX: "PIX",
    CREDIT_CARD: "Cartão de crédito",
    DEBIT_CARD: "Cartão de débito",
  };
  return map[m] ?? m;
}

export function paymentStatusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: "Pendente",
    COMPLETED: "Pago",
    FAILED: "Falhou",
  };
  return map[s] ?? s;
}

export function paymentStatusVariant(
  s: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (s === "COMPLETED") return "default";
  if (s === "FAILED") return "destructive";
  return "secondary";
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Limites de plano que ultrapassam este valor são tratados como "ilimitado" na UI —
 * planos premium usam valores sentinela (ex.: 9999) que ninguém atinge em uso legítimo.
 */
export function isUnlimitedPlanLimit(max: number | null | undefined): boolean {
  return max != null && max >= 1000;
}

/** Compute price from a public trip + chosen enrollment type. */
export function tripPriceFor(
  trip: { priceOneWay?: number; priceReturn?: number; priceRoundTrip?: number },
  type: "ONE_WAY" | "RETURN" | "ROUND_TRIP",
): number | undefined {
  if (type === "ONE_WAY") return trip.priceOneWay;
  if (type === "RETURN") return trip.priceReturn;
  return trip.priceRoundTrip;
}
