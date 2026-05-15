import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bus,
  Users,
  CheckCircle2,
  Calendar,
  User,
  TrendingUp,
  DollarSign,
  Percent,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingList } from "@/components/feedback/LoadingList";
import { useRole } from "@/lib/role-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import { formatDateTime, formatPrice, statusLabel, statusVariant } from "@/lib/format";
import type { TripInstance } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { adminOrgId } = useRole();
  const { trips, loading } = useTrips({ orgId: adminOrgId ?? "" });

  const list = trips ?? [];
  const total = list.length;

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

  const expectedRevenue = activeTrips.reduce(
    (sum, t) => sum + (t.bookedCount ?? 0) * (t.priceOneWay ?? 0),
    0,
  );

  const upcoming = activeTrips
    .slice()
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
    .slice(0, 5);

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          icon={<Bus className="h-4 w-4" />}
          label="Viagens ativas"
          value={activeTrips.length.toString()}
          hint={`${total} no total`}
        />
        <MetricCard
          icon={<Calendar className="h-4 w-4" />}
          label="Próximos 7 dias"
          value={nextWeek.length.toString()}
        />
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Passageiros"
          value={totalBooked.toString()}
          hint={totalSeats > 0 ? `${totalSeats} vagas totais` : undefined}
        />
        <MetricCard
          icon={<Percent className="h-4 w-4" />}
          label="Ocupação média"
          value={`${occupancyRate}%`}
        />
      </div>

      {expectedRevenue > 0 && (
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            Receita prevista
          </div>
          <div className="text-2xl font-semibold">{formatPrice(expectedRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Soma dos inscritos × preço de ida em viagens não finalizadas
          </p>
        </Card>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Próximas viagens
        </h2>
        <Link to="/trips" className="text-sm text-primary">
          Ver todas
        </Link>
      </div>

      {loading ? (
        <LoadingList count={3} height="h-16" />
      ) : upcoming.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhuma viagem agendada.
        </Card>
      ) : (
        <div className="space-y-2">
          {upcoming.map((t) => (
            <UpcomingTripRow key={t.id} trip={t} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function UpcomingTripRow({ trip: t }: { trip: TripInstance }) {
  const { name: driverName } = useDriverName(t.driverId);
  const occupancy =
    t.totalCapacity > 0 ? Math.round(((t.bookedCount ?? 0) / t.totalCapacity) * 100) : 0;
  return (
    <Link
      to="/trip/$tripId"
      params={{ tripId: t.id }}
      className="block active:opacity-80 transition-opacity"
    >
      <Card className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-sm font-medium">{formatDateTime(t.departureTime)}</div>
          <Badge variant={statusVariant(t.tripStatus)}>{statusLabel(t.tripStatus)}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {t.bookedCount ?? 0} / {t.totalCapacity} ({occupancy}%)
          </span>
          {t.driverId && driverName ? (
            <span className="flex items-center gap-1 truncate max-w-[50%]">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{driverName}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <CheckCircle2 className="h-3 w-3" />
              Sem motorista
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint ? <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div> : null}
    </Card>
  );
}
