export type DateRange = "ANY" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "NEXT_WEEK";

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "ANY", label: "Qualquer data" },
  { value: "TODAY", label: "Hoje" },
  { value: "TOMORROW", label: "Amanhã" },
  { value: "THIS_WEEK", label: "Esta semana" },
  { value: "NEXT_WEEK", label: "Próxima semana" },
];

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function dateRangeBounds(range: DateRange): { from: Date; to: Date } | null {
  if (range === "ANY") return null;
  const now = new Date();
  const today = startOfDay(now);
  if (range === "TODAY") {
    const to = new Date(today);
    to.setDate(to.getDate() + 1);
    return { from: today, to };
  }
  if (range === "TOMORROW") {
    const from = new Date(today);
    from.setDate(from.getDate() + 1);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from, to };
  }
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  if (range === "THIS_WEEK") {
    const to = new Date(weekStart);
    to.setDate(to.getDate() + 7);
    return { from: today, to };
  }
  const from = new Date(weekStart);
  from.setDate(from.getDate() + 7);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  return { from, to };
}

export function isInDateRange(iso: string, range: DateRange): boolean {
  const bounds = dateRangeBounds(range);
  if (!bounds) return true;
  const t = new Date(iso);
  return t >= bounds.from && t < bounds.to;
}
