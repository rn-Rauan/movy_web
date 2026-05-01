import type { TripStatus } from "./types";

export function formatDateTime(iso: string, timeOnly = false) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (timeOnly) {
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  }
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
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
    timeZone: "UTC",
  });
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

/** Compute price from a public trip + chosen enrollment type. */
export function tripPriceFor(
  trip: { priceOneWay?: number; priceReturn?: number; priceRoundTrip?: number },
  type: "ONE_WAY" | "RETURN" | "ROUND_TRIP",
): number | undefined {
  if (type === "ONE_WAY") return trip.priceOneWay;
  if (type === "RETURN") return trip.priceReturn;
  return trip.priceRoundTrip;
}
