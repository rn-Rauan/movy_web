import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bus,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  BarChart3,
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
import { formatPrice } from "@/lib/format";
import type { TripInstance } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/dashboard")({
  component: DashboardPage,
});

const DAY_LABELS_BR = ["D", "S", "T", "Q", "Q", "S", "S"];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(name?: string) {
  if (!name) return "admin";
  return name.trim().split(/\s+/)[0] ?? "admin";
}

function DashboardPage() {
  const { adminOrgId } = useRole();
  const { user } = useAuth();
  const { trips, loading } = useTrips({ orgId: adminOrgId ?? "" });

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
  const occupancyRate = totalSeats > 0 ? Math.round((totalBooked / totalSeats) * 100) : 0;

  const emptyTrips = activeTrips.filter((t) => (t.bookedCount ?? 0) === 0).length;
  const expectedRevenue = activeTrips.reduce(
    (sum, t) => sum + (t.bookedCount ?? 0) * (t.priceOneWay ?? 0),
    0,
  );

  // Mini chart — partidas por dia nos próximos 7 dias (dom→sáb relativo a hoje)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekBuckets = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const count = activeTrips.filter((t) => {
      const dep = new Date(t.departureTime).getTime();
      return dep >= day.getTime() && dep < next.getTime();
    }).length;
    return { weekday: day.getDay(), count };
  });
  const weekMax = Math.max(1, ...weekBuckets.map((b) => b.count));
  const todayIdx = 0;

  const upcoming = activeTrips
    .slice()
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
    .slice(0, 5);

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

        {/* Hero KPI: ocupação média */}
        <div className="relative overflow-hidden rounded-2xl bg-ink p-4 text-white">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.3px] text-white/60">
                Ocupação média
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <div className="font-mono text-[44px] font-extrabold leading-none tracking-[-1.5px]">
                  {occupancyRate}
                  <span className="text-[26px] text-white/50">%</span>
                </div>
              </div>
              <div className="mt-1 text-[12px] text-white/60">
                {totalBooked} de {totalSeats} vagas vendidas
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold">
              <TrendingUp className="h-3 w-3" strokeWidth={1.8} />
              Esta semana
            </div>
          </div>
          {/* Mini chart */}
          <div className="flex h-11 items-end gap-1.5">
            {weekBuckets.map((b, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={
                    i === todayIdx ? "w-full rounded bg-accent" : "w-full rounded bg-white/[0.18]"
                  }
                  style={{ height: `${(b.count / weekMax) * 36 + 4}px` }}
                />
                <div className="text-[9px] font-semibold opacity-50">
                  {DAY_LABELS_BR[b.weekday]}
                </div>
              </div>
            ))}
          </div>
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
                {weekBuckets.map((b, i) => (
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
          {emptyTrips > 0 ? (
            <KpiCard
              variant="warn"
              icon={AlertCircle}
              label="Atenção"
              value={emptyTrips}
              hint="sem inscritos"
              footer={
                <div className="text-[11px] text-muted-foreground">
                  Risco de cancelamento automático
                </div>
              }
            />
          ) : expectedRevenue > 0 ? (
            <KpiCard
              icon={TrendingUp}
              label="Receita prevista"
              value={
                <span className="text-[20px] tracking-[-0.6px]">
                  {formatPrice(expectedRevenue)}
                </span>
              }
              hint="este mês"
            />
          ) : (
            <KpiCard variant="warn" icon={AlertCircle} label="Status" value={0} hint="tudo ok" />
          )}
        </div>

        {/* Link pro relatório financeiro completo */}
        <Link
          to="/financial"
          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 transition hover:bg-surface-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </div>
            <div>
              <div className="text-[13px] font-extrabold tracking-[-0.2px] text-ink">
                Relatório financeiro
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Receita, ocupação e top rotas do mês
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
        </Link>

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

function UpcomingTripCard({ trip: t }: { trip: TripInstance }) {
  const dep = new Date(t.departureTime);
  const date = `${String(dep.getUTCDate()).padStart(2, "0")}/${String(
    dep.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
  const time = `${String(dep.getUTCHours()).padStart(2, "0")}:${String(
    dep.getUTCMinutes(),
  ).padStart(2, "0")}`;

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
