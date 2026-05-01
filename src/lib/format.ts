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
    COMPLETED: "Concluída",
    CANCELLED: "Cancelada",
  };
  return map[s] ?? s;
}

export function statusVariant(
  s: TripStatus | string,
): "default" | "secondary" | "destructive" | "outline" {
  if (s === "CONFIRMED" || s === "IN_PROGRESS") return "default";
  if (s === "SCHEDULED") return "secondary";
  if (s === "CANCELLED") return "destructive";
  return "outline";
}

export function canEnroll(s: TripStatus | string) {
  return s === "SCHEDULED" || s === "CONFIRMED";
}

export function bookingStatusLabel(s: string) {
  const map: Record<string, string> = {
    ACTIVE: "Ativa",
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
    NO_SHOW: "Faltou",
  };
  return map[s] ?? s;
}
