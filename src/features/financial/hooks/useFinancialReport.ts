import { useEffect, useState } from "react";
import { paymentsService } from "@/services/payments.service";
import { tripsService } from "@/services/trips.service";
import { paymentBucketDate } from "@/lib/format";
import {
  addBrMonths,
  brDayOfWeek,
  getBrDayOfMonth,
  getBrMonth,
  getBrYear,
  startOfBrMonth,
} from "@/lib/timezone";
import type { Payment, TripInstance, Paginated } from "@/lib/types";

export type FinancialReport = {
  /** Mês de referência (1º dia 00:00 BR ≡ 03:00 UTC). */
  monthStart: Date;
  /** Receita total = confirmed + pending (perdida fica de fora pra não inflar). */
  revTotal: number;
  revConfirmed: number;
  revPending: number;
  revLost: number;
  /** Receita do mês anterior (só CONFIRMED) — base do delta. */
  prevRevConfirmed: number;
  /** Delta vs mês anterior em % (com sinal). null se mês anterior = 0. */
  deltaPct: number | null;
  /** Receita confirmada por semana (4 ou 5 buckets, dependendo do mês). */
  weeks: number[];
  weekLabels: string[];
  /** Receita confirmada por dia da semana × semana do mês — pro heatmap. */
  daysGrid: number[][];
  /** Contagens de viagens do mês por status. */
  trips: {
    realized: number; // FINISHED
    confirmed: number; // CONFIRMED
    scheduled: number; // SCHEDULED
    canceled: number; // CANCELED
    draft: number; // DRAFT
    inProgress: number; // IN_PROGRESS
  };
  /** Total de passageiros (sum bookedCount) em viagens FINISHED + IN_PROGRESS + CONFIRMED. */
  passengers: number;
  /** Ocupação média (%) ponderada por capacidade nas viagens não-canceladas/draft. */
  avgOccupation: number;
  /** Ticket médio = revConfirmed / passengers (0 se passengers === 0). */
  avgTicket: number;
  /** Top rotas por receita prevista (sum bookedCount × priceOneWay). */
  topRoutes: {
    key: string;
    from: string;
    to: string;
    trips: number;
    rev: number;
    occ: number; // %
  }[];
};

function inRange(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

async function fetchAllPayments(orgId: string): Promise<Payment[]> {
  const out: Payment[] = [];
  let page = 1;
  const size = 100;
  for (let i = 0; i < 20; i++) {
    const res = await paymentsService.list(orgId, page, size);
    const list = Array.isArray(res) ? res : (res.data ?? []);
    out.push(...list);
    const meta = !Array.isArray(res) ? (res as Paginated<Payment>) : null;
    if (!meta || list.length < size || (meta.totalPages && page >= meta.totalPages)) break;
    page += 1;
  }
  return out;
}

function aggregate(payments: Payment[], trips: TripInstance[], monthStart: Date): FinancialReport {
  const monthEnd = addBrMonths(monthStart, 1);
  const prevStart = addBrMonths(monthStart, -1);

  // Bucketing por dia da viagem (tripDepartureTime) com fallback pra createdAt
  // enquanto o backend ainda não enriquece o PaymentResponse com esse campo.
  const paymentsInMonth = payments.filter((p) => {
    const iso = paymentBucketDate(p);
    return iso && inRange(iso, monthStart, monthEnd);
  });
  const paymentsPrevMonth = payments.filter((p) => {
    const iso = paymentBucketDate(p);
    return iso && inRange(iso, prevStart, monthStart);
  });

  let revConfirmed = 0;
  let revPending = 0;
  let revLost = 0;
  for (const p of paymentsInMonth) {
    if (p.status === "COMPLETED") revConfirmed += p.amount;
    else if (p.status === "PENDING") revPending += p.amount;
    else if (p.status === "FAILED") revLost += p.amount;
  }
  const prevRevConfirmed = paymentsPrevMonth
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);
  const deltaPct =
    prevRevConfirmed > 0 ? ((revConfirmed - prevRevConfirmed) / prevRevConfirmed) * 100 : null;

  // ── Buckets por semana ───────────────────────────────────────────────────
  // Bucket = floor((dayOfMonth BR - 1) / 7). Mês pode ter 4 ou 5 buckets.
  const monthYear = getBrYear(monthStart);
  const monthNum = getBrMonth(monthStart); // 1-12
  // Last day of the month (calendar-only, independent of timezone).
  const daysInMonth = new Date(Date.UTC(monthYear, monthNum, 0)).getUTCDate();
  const weekCount = Math.ceil(daysInMonth / 7);
  const weeks = new Array<number>(weekCount).fill(0);
  for (const p of paymentsInMonth) {
    if (p.status !== "COMPLETED") continue;
    const iso = paymentBucketDate(p);
    if (!iso) continue;
    const day = getBrDayOfMonth(iso);
    const bucket = Math.min(weekCount - 1, Math.floor((day - 1) / 7));
    weeks[bucket]! += p.amount;
  }
  const weekLabels = weeks.map((_, i) => `Sem ${i + 1}`);

  // ── Heatmap semana × dia da semana ───────────────────────────────────────
  const daysGrid: number[][] = Array.from({ length: weekCount }, () => new Array(7).fill(0));
  for (const p of paymentsInMonth) {
    if (p.status !== "COMPLETED") continue;
    const iso = paymentBucketDate(p);
    if (!iso) continue;
    const day = getBrDayOfMonth(iso);
    const bucket = Math.min(weekCount - 1, Math.floor((day - 1) / 7));
    const dayOfWeek = brDayOfWeek(iso); // 0 = Dom
    daysGrid[bucket]![dayOfWeek]! += p.amount;
  }

  // ── Trips do mês ─────────────────────────────────────────────────────────
  const tripsInMonth = trips.filter((t) => inRange(t.departureTime, monthStart, monthEnd));

  const tripsByStatus = {
    realized: 0,
    confirmed: 0,
    scheduled: 0,
    canceled: 0,
    draft: 0,
    inProgress: 0,
  };
  for (const t of tripsInMonth) {
    if (t.tripStatus === "FINISHED") tripsByStatus.realized++;
    else if (t.tripStatus === "CONFIRMED") tripsByStatus.confirmed++;
    else if (t.tripStatus === "SCHEDULED") tripsByStatus.scheduled++;
    else if (t.tripStatus === "CANCELED") tripsByStatus.canceled++;
    else if (t.tripStatus === "DRAFT") tripsByStatus.draft++;
    else if (t.tripStatus === "IN_PROGRESS") tripsByStatus.inProgress++;
  }

  // Passageiros: bookedCount em viagens não-canceladas/rascunho
  const effectiveTrips = tripsInMonth.filter(
    (t) => t.tripStatus !== "CANCELED" && t.tripStatus !== "DRAFT",
  );
  const passengers = effectiveTrips.reduce((s, t) => s + (t.bookedCount ?? 0), 0);
  const totalSeats = effectiveTrips.reduce((s, t) => s + (t.totalCapacity ?? 0), 0);
  const avgOccupation = totalSeats > 0 ? Math.round((passengers / totalSeats) * 100) : 0;
  const avgTicket = passengers > 0 ? revConfirmed / passengers : 0;

  // ── Top rotas (por receita prevista, agrupado por origem→destino) ───────
  const routeMap = new Map<
    string,
    { from: string; to: string; trips: number; bookedSum: number; seatSum: number; rev: number }
  >();
  for (const t of effectiveTrips) {
    const from = t.template?.origin ?? t.departurePoint ?? "—";
    const to = t.template?.destination ?? t.destination ?? "—";
    const key = `${from}→${to}`;
    const booked = t.bookedCount ?? 0;
    const seats = t.totalCapacity ?? 0;
    const price = t.priceOneWay ?? 0;
    const entry = routeMap.get(key) ?? { from, to, trips: 0, bookedSum: 0, seatSum: 0, rev: 0 };
    entry.trips += 1;
    entry.bookedSum += booked;
    entry.seatSum += seats;
    entry.rev += booked * price;
    routeMap.set(key, entry);
  }
  const topRoutes = Array.from(routeMap.entries())
    .map(([key, v]) => ({
      key,
      from: v.from,
      to: v.to,
      trips: v.trips,
      rev: v.rev,
      occ: v.seatSum > 0 ? Math.round((v.bookedSum / v.seatSum) * 100) : 0,
    }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 5);

  return {
    monthStart,
    revTotal: revConfirmed + revPending,
    revConfirmed,
    revPending,
    revLost,
    prevRevConfirmed,
    deltaPct,
    weeks,
    weekLabels,
    daysGrid,
    trips: tripsByStatus,
    passengers,
    avgOccupation,
    avgTicket,
    topRoutes,
  };
}

export function useFinancialReport(
  orgId: string | null | undefined,
  monthStart: Date = startOfBrMonth(),
) {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Discrimina re-fetch só quando o orgId ou o início de mês mudam (ISO da data)
  const monthIso = monthStart.toISOString();

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchAllPayments(orgId), tripsService.listByOrgId(orgId)])
      .then(([payments, tripsRes]) => {
        if (cancelled) return;
        const trips: TripInstance[] = Array.isArray(tripsRes) ? tripsRes : (tripsRes.data ?? []);
        const agg = aggregate(payments, trips, new Date(monthIso));
        setReport(agg);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar relatório");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, monthIso, refreshKey]);

  // Re-busca quando a aba volta a ficar visível (admin confirmou pagamento em outra
  // tela e voltou pra cá sem navegar — visibility é o gatilho mais confiável).
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        setRefreshKey((k) => k + 1);
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return {
    report,
    loading,
    error,
    refetch: () => setRefreshKey((k) => k + 1),
  };
}
