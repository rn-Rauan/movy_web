import { brDayOfWeek, startOfBrDay } from "./timezone";

export type DateRange = "ANY" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "NEXT_WEEK";

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "ANY", label: "Qualquer data" },
  { value: "TODAY", label: "Hoje" },
  { value: "TOMORROW", label: "Amanhã" },
  { value: "THIS_WEEK", label: "Esta semana" },
  { value: "NEXT_WEEK", label: "Próxima semana" },
];

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}

export function dateRangeBounds(range: DateRange): { from: Date; to: Date } | null {
  if (range === "ANY") return null;
  // "Hoje em BR" como instante absoluto (00:00 BR = 03:00 UTC).
  const today = startOfBrDay();
  if (range === "TODAY") {
    return { from: today, to: addDays(today, 1) };
  }
  if (range === "TOMORROW") {
    const from = addDays(today, 1);
    return { from, to: addDays(from, 1) };
  }
  const dow = brDayOfWeek(today);
  const weekStart = addDays(today, -dow);
  if (range === "THIS_WEEK") {
    return { from: today, to: addDays(weekStart, 7) };
  }
  const from = addDays(weekStart, 7);
  return { from, to: addDays(from, 7) };
}

export function isInDateRange(iso: string, range: DateRange): boolean {
  const bounds = dateRangeBounds(range);
  if (!bounds) return true;
  const t = new Date(iso);
  return t >= bounds.from && t < bounds.to;
}
