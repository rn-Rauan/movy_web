import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bus,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { KpiCard } from "@/components/visual/KpiCard";
import { RouteVisual } from "@/components/visual/RouteVisual";
import { OccupancyBar } from "@/components/visual/OccupancyBar";
import { StatusPill } from "@/components/visual/StatusPill";
import { useRole } from "@/lib/role-context";
import { useAuth } from "@/lib/auth-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useOrgRevenue } from "@/features/financial/hooks/useOrgRevenue";
import { paymentBucketDate } from "@/lib/format";
import {
  brDayOfWeek,
  getBrDayOfMonth,
  getBrHour,
  getBrMinute,
  getBrMonth,
  isoToBrYmd,
  startOfBrDay,
} from "@/lib/timezone";
import type { Payment, TripInstance } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/dashboard")({
  component: DashboardPage,
});

const DAY_LABELS_BR = ["D", "S", "T", "Q", "Q", "S", "S"];

function greeting() {
  const hour = getBrHour(new Date());
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(name?: string) {
  if (!name) return "admin";
  return name.trim().split(/\s+/)[0] ?? "admin";
}

function addDaysUtc(d: Date, n: number): Date {
  const c = new Date(d);
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}

const FULL_WEEKDAY_PT = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** "Quarta · 22/05" a partir de YYYY-MM-DD em BR. */
function formatDayLabel(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const [, y, mo, d] = m;
  // 00:00 BR daquele dia (UTC offset +3) — pra extrair weekday em BR
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 3, 0, 0));
  return `${FULL_WEEKDAY_PT[brDayOfWeek(date)]} · ${d}/${mo}`;
}

type RevenueBucket = {
  ymd: string;
  weekday: number;
  confirmed: number;
  pending: number;
};
type TripsBucket = { weekday: number; count: number };

/**
 * Receita por dia BR dos últimos 7 dias (índice 0 = -6 dias atrás, 6 = hoje).
 * Retorna confirmados e pendentes separadamente — a barra do chart usa o total.
 */
function buildRevenueLast7BrDays(today: Date, payments: Payment[]): RevenueBucket[] {
  const buckets: RevenueBucket[] = Array.from({ length: 7 }, (_, i) => {
    const day = addDaysUtc(today, i - 6);
    return { ymd: isoToBrYmd(day), weekday: brDayOfWeek(day), confirmed: 0, pending: 0 };
  });
  const byYmd = new Map(buckets.map((b) => [b.ymd, b]));
  for (const p of payments) {
    // Agrupa pelo dia da VIAGEM (departureTime), com fallback pra createdAt
    const bucketIso = paymentBucketDate(p);
    if (!bucketIso) continue;
    const b = byYmd.get(isoToBrYmd(bucketIso));
    if (!b) continue;
    if (p.status === "COMPLETED") b.confirmed += p.amount;
    else if (p.status === "PENDING") b.pending += p.amount;
  }
  return buckets;
}

/** Partidas previstas por dia BR dos próximos 7 dias (índice 0 = hoje). */
function buildTripsNext7BrDays(today: Date, trips: TripInstance[]): TripsBucket[] {
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const day = addDaysUtc(today, i);
    return { ymd: isoToBrYmd(day), weekday: brDayOfWeek(day), count: 0 };
  });
  const byYmd = new Map(buckets.map((b) => [b.ymd, b]));
  for (const t of trips) {
    const ymd = isoToBrYmd(t.departureTime);
    const b = byYmd.get(ymd);
    if (b) b.count += 1;
  }
  return buckets.map(({ weekday, count }) => ({ weekday, count }));
}

function formatBRLParts(value: number) {
  const fixed = value.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const intWithSep = Number(intPart).toLocaleString("pt-BR");
  return { intPart: intWithSep, decPart: decPart ?? "00" };
}

function DashboardPage() {
  const { adminOrgId } = useRole();
  const { user } = useAuth();
  const { trips, loading } = useTrips({ orgId: adminOrgId ?? "" });
  // KPI grande mostra o dia (default = hoje); a receita do mês fica em /financial.
  const { payments } = useOrgRevenue(adminOrgId);

  // Default: dia de hoje em BR sempre selecionado. Receita do mês fica em /financial.
  const [selectedYmd, setSelectedYmd] = useState<string>(() => isoToBrYmd(startOfBrDay()));

  const list = trips ?? [];
  const activeTrips = list.filter(
    (t) => t.tripStatus !== "FINISHED" && t.tripStatus !== "CANCELED",
  );
  const now = Date.now();
  const sevenDaysAhead = now + 7 * 24 * 60 * 60 * 1000;
  const nextWeek = activeTrips.filter((t) => {
    const dep = new Date(t.departureTime).getTime();
    return dep >= now && dep <= sevenDaysAhead;
  });

  const totalSeats = activeTrips.reduce((sum, t) => sum + (t.totalCapacity ?? 0), 0);
  const totalBooked = activeTrips.reduce((sum, t) => sum + (t.bookedCount ?? 0), 0);

  const emptyTrips = activeTrips.filter((t) => (t.bookedCount ?? 0) === 0).length;

  // Mini chart no hero — receita por dia BR dos últimos 7 dias (incluindo hoje).
  // KpiCard de "Próximos 7 dias" — partidas previstas (continua sendo trips count).
  const today = startOfBrDay();
  const todayYmd = isoToBrYmd(today);
  const revenueLast7 = buildRevenueLast7BrDays(today, payments);
  const tripsNext7 = buildTripsNext7BrDays(today, activeTrips);

  // KPI grande mostra sempre o dia selecionado (default = hoje).
  const selectedBucket =
    revenueLast7.find((b) => b.ymd === selectedYmd) ??
    revenueLast7.find((b) => b.ymd === todayYmd)!;
  const displayConfirmed = selectedBucket.confirmed;
  const displayPending = selectedBucket.pending;
  const displayTotal = displayConfirmed + displayPending;
  const displayLabel = formatDayLabel(selectedBucket.ymd);
  const displayBadge = selectedBucket.ymd === todayYmd ? "Hoje" : "Dia selecionado";

  const upcoming = activeTrips
    .slice()
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
    .slice(0, 4);

  const { intPart, decPart } = formatBRLParts(displayTotal);

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-3">
        {/* Greeting */}
        <div className="mb-1">
          <div className="text-[12px] font-semibold uppercase tracking-[0.3px] text-muted-foreground">
            {greeting()}
          </div>
          <div className="mt-0.5 text-[22px] font-extrabold leading-tight tracking-[-0.5px] text-ink">
            {firstName(user?.name)}, bem-vindo
          </div>
        </div>

        {/* Hero KPI: Receita do mês (ou do dia selecionado) */}
        <div className="relative overflow-hidden rounded-[18px] bg-ink p-4 text-white">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3px] text-white/60">
                {displayLabel}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-[18px] font-bold text-white/55">R$</span>
                <div className="font-mono text-[40px] font-extrabold leading-none tracking-[-1.5px]">
                  {intPart}
                  <span className="text-[22px] text-white/50">,{decPart}</span>
                </div>
              </div>
              <div className="mt-1 text-[12px] text-white/60">
                R$ {displayConfirmed.toFixed(2).replace(".", ",")} confirmados · R${" "}
                {displayPending.toFixed(2).replace(".", ",")} pendentes
              </div>
            </div>
            <div className="flex flex-none items-center gap-1 rounded-[10px] bg-white/10 px-2 py-1 text-[11px] font-semibold">
              <TrendingUp className="h-3 w-3" strokeWidth={1.8} />
              {displayBadge}
            </div>
          </div>

          {/* Mini chart — receita por dia BR (últimos 7 dias), selecionável */}
          <div className="flex h-12 items-end gap-1.5">
            {(() => {
              const max = Math.max(1, ...revenueLast7.map((b) => b.confirmed + b.pending));
              return revenueLast7.map((b) => {
                const total = b.confirmed + b.pending;
                const isSelected = selectedYmd === b.ymd;
                return (
                  <button
                    key={b.ymd}
                    type="button"
                    onClick={() => setSelectedYmd(b.ymd)}
                    className="flex flex-1 flex-col items-center gap-1 cursor-pointer focus:outline-none"
                    aria-label={`Receita ${formatDayLabel(b.ymd)}`}
                    aria-pressed={isSelected}
                  >
                    <div
                      className={
                        isSelected
                          ? "w-full rounded bg-accent transition-colors"
                          : "w-full rounded bg-white/[0.18] hover:bg-white/[0.28] transition-colors"
                      }
                      style={{ height: `${(total / max) * 36 + 4}px` }}
                    />
                    <div
                      className={
                        isSelected
                          ? "text-[9px] font-extrabold text-accent"
                          : "text-[9px] font-semibold opacity-50"
                      }
                    >
                      {DAY_LABELS_BR[b.weekday]}
                    </div>
                  </button>
                );
              });
            })()}
          </div>

          {/* CTA: relatório completo */}
          <Link
            to="/financial"
            className="mt-3.5 flex w-full items-center justify-between gap-2 rounded-[10px] border border-white/[0.12] bg-white/[0.08] px-3 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/[0.12]"
          >
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />
              Ver relatório completo do mês
            </span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>

        {/* KPI grid 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          <KpiCard
            icon={Bus}
            label="Viagens ativas"
            value={activeTrips.length}
            hint={`de ${list.length} total`}
          />
          <KpiCard
            icon={Calendar}
            label="Próximos 7 dias"
            value={nextWeek.length}
            hint="partidas"
            footer={
              <div className="flex gap-0.5">
                {tripsNext7.map((b, i) => (
                  <div
                    key={i}
                    className={
                      b.count > 0
                        ? "h-1 flex-1 rounded-full bg-accent"
                        : "h-1 flex-1 rounded-full bg-line-soft"
                    }
                  />
                ))}
              </div>
            }
          />
          <KpiCard
            icon={Users}
            label="Passageiros"
            value={totalBooked}
            hint="inscritos"
            footer={
              totalSeats > 0 ? (
                <div className="text-[10px] text-muted-foreground">
                  {totalSeats - totalBooked} vagas disponíveis
                </div>
              ) : null
            }
          />
          <AlertKpiCard emptyTrips={emptyTrips} />
        </div>

        {/* Próximas viagens */}
        <div className="mt-1 flex items-baseline justify-between px-0.5">
          <h2 className="text-[15px] font-extrabold tracking-[-0.2px] text-ink">
            Próximas viagens
          </h2>
          <Link to="/trips" className="flex items-center gap-0.5 text-[12px] font-bold text-accent">
            Ver todas
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </Link>
        </div>

        {loading ? (
          <LoadingList count={3} height="h-20" />
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-6 text-center text-sm text-muted-foreground">
            Nenhuma viagem agendada.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((t) => (
              <UpcomingTripCard key={t.id} trip={t} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AlertKpiCard({ emptyTrips }: { emptyTrips: number }) {
  const hasAlert = emptyTrips > 0;
  const title = hasAlert
    ? emptyTrips === 1
      ? "1 viagem sem inscritos"
      : `${emptyTrips} viagens sem inscritos`
    : "Sem alertas";
  const subtitle = hasAlert
    ? "Risco de cancelamento automático"
    : "Nenhuma viagem em risco no momento";

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-warning">
        <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.6} />
        <span className="text-[11px] font-bold uppercase tracking-[0.3px]">
          {hasAlert ? "Atenção" : "Tudo certo"}
        </span>
      </div>
      <div className="text-[13px] font-bold leading-[1.25] text-ink">{title}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{subtitle}</div>
    </div>
  );
}

function UpcomingTripCard({ trip: t }: { trip: TripInstance }) {
  const dep = new Date(t.departureTime);
  const date = `${String(getBrDayOfMonth(dep)).padStart(2, "0")}/${String(getBrMonth(dep)).padStart(
    2,
    "0",
  )}`;
  const time = `${String(getBrHour(dep)).padStart(2, "0")}:${String(getBrMinute(dep)).padStart(
    2,
    "0",
  )}`;

  const from = t.template?.origin ?? t.departurePoint ?? "—";
  const to = t.template?.destination ?? t.destination ?? "—";

  return (
    <Link
      to="/trip/$tripId"
      params={{ tripId: t.id }}
      className="block rounded-2xl border border-line bg-surface p-3 transition active:opacity-80"
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <div className="font-mono text-[18px] font-extrabold tracking-[-0.5px] text-ink">
            {date}
          </div>
          <div className="text-[12px] font-semibold text-muted-foreground">{time}</div>
        </div>
        <StatusPill status={t.tripStatus} />
      </div>
      <RouteVisual from={from} to={to} />
      <div className="mt-3">
        <OccupancyBar booked={t.bookedCount ?? 0} total={t.totalCapacity ?? 0} />
      </div>
    </Link>
  );
}
