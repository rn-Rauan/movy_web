import { useEffect, useState } from "react";
import { paymentsService } from "@/services/payments.service";
import { tripsService } from "@/services/trips.service";
import { ApiError } from "@/lib/api";
import { fetchAllPages } from "@/lib/paginate";
import { paymentBucketDate } from "@/lib/format";
import {
  addBrMonths,
  brDayOfWeek,
  getBrDayOfMonth,
  getBrMonth,
  getBrYear,
  startOfBrMonth,
} from "@/lib/timezone";
import { apiErrorMessage } from "@/lib/handle-error";
import type { Payment, TripInstance } from "@/lib/types";

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
  /** Receita perdida em viagens CANCELED do mês (receita prevista: bookedCount × priceOneWay). */
  canceledLostRevenue: number;
  /** Total de passageiros (sum bookedCount) nas viagens do mês exceto CANCELED/DRAFT. */
  passengers: number;
  /** Ocupação média (%) ponderada por capacidade nas viagens não-canceladas/draft. */
  avgOccupation: number;
  /** Ticket médio = revConfirmed / nº de pagamentos COMPLETED (0 se nenhum). */
  avgTicket: number;
  /** Top rotas por receita REAL (sum dos payments COMPLETED+PENDING das viagens da rota). */
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

function aggregate(payments: Payment[], trips: TripInstance[], monthStart: Date): FinancialReport {
  const monthEnd = addBrMonths(monthStart, 1);
  const prevStart = addBrMonths(monthStart, -1);

  // Relatório de VIAGENS: ignora payments órfãos (sem enrollment/trip — ex.: cobranças
  // de assinatura SaaS). Receita de assinatura vive em /payments, não aqui.
  const tripPayments = payments.filter((p) => p.enrollmentId != null || p.tripInstanceId != null);

  // Bucketing por dia da viagem (tripDepartureTime), com fallback pra createdAt.
  const paymentsInMonth = tripPayments.filter((p) => {
    const iso = paymentBucketDate(p);
    return iso && inRange(iso, monthStart, monthEnd);
  });
  const paymentsPrevMonth = tripPayments.filter((p) => {
    const iso = paymentBucketDate(p);
    return iso && inRange(iso, prevStart, monthStart);
  });

  let revConfirmed = 0;
  let revPending = 0;
  let revLost = 0;
  let completedCount = 0;
  for (const p of paymentsInMonth) {
    if (p.status === "COMPLETED") {
      revConfirmed += p.amount;
      completedCount += 1;
    } else if (p.status === "PENDING") revPending += p.amount;
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
  // Ticket médio = valor médio por pagamento confirmado (mesma base do hero).
  const avgTicket = completedCount > 0 ? revConfirmed / completedCount : 0;

  // Receita perdida em viagens canceladas (prevista — bookedCount × priceOneWay).
  const canceledLostRevenue = tripsInMonth
    .filter((t) => t.tripStatus === "CANCELED")
    .reduce((s, t) => s + (t.bookedCount ?? 0) * (t.priceOneWay ?? 0), 0);

  // ── Top rotas (por receita REAL, agrupado por origem→destino) ────────────
  // occ/trips vêm das viagens; rev vem dos payments reais (join tripInstanceId → rota).
  const routeOf = (t: TripInstance) => ({
    from: t.template?.origin ?? t.departurePoint ?? "—",
    to: t.template?.destination ?? t.destination ?? "—",
  });
  const routeKeyByTrip = new Map<string, string>(); // tripInstanceId → routeKey
  const routeMap = new Map<
    string,
    { from: string; to: string; trips: number; bookedSum: number; seatSum: number; rev: number }
  >();
  for (const t of effectiveTrips) {
    const { from, to } = routeOf(t);
    const key = `${from}→${to}`;
    routeKeyByTrip.set(t.id, key);
    const entry = routeMap.get(key) ?? { from, to, trips: 0, bookedSum: 0, seatSum: 0, rev: 0 };
    entry.trips += 1;
    entry.bookedSum += t.bookedCount ?? 0;
    entry.seatSum += t.totalCapacity ?? 0;
    routeMap.set(key, entry);
  }
  // Soma a receita real (confirmada + pendente) por rota via o payment → viagem.
  for (const p of paymentsInMonth) {
    if (p.status !== "COMPLETED" && p.status !== "PENDING") continue;
    if (!p.tripInstanceId) continue;
    const key = routeKeyByTrip.get(p.tripInstanceId);
    if (!key) continue; // payment de viagem cancelada/fora do conjunto efetivo
    routeMap.get(key)!.rev += p.amount;
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
    canceledLostRevenue,
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

    // Payments tolerante a 403/404 (admin sem permissão de listar pagamentos): relatório
    // segue com receita 0 e métricas de viagem normais, em vez de virar tela de erro.
    const paymentsP = fetchAllPages<Payment>((page, limit) =>
      paymentsService.list(orgId, page, limit),
    ).catch((err) => {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) return [];
      throw err;
    });
    const tripsP = fetchAllPages<TripInstance>((page, limit) =>
      tripsService.listByOrgId(orgId, page, limit),
    );

    Promise.all([paymentsP, tripsP])
      .then(([payments, trips]) => {
        if (cancelled) return;
        const agg = aggregate(payments, trips, new Date(monthIso));
        setReport(agg);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err, "Erro ao carregar relatório"));
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
