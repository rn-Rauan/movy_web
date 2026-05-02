import { createFileRoute, Link } from "@tanstack/react-router";
import { Bus, FileText, Users, CheckCircle2, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingList } from "@/components/feedback/LoadingList";
import { useRole } from "@/lib/role-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";

export const Route = createFileRoute("/_protected/_admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { adminOrgId } = useRole();
  const { trips, loading } = useTrips({ orgId: adminOrgId ?? "" });

  const list = trips ?? [];
  const total = list.length;
  const scheduled = list.filter((t) => t.tripStatus === "SCHEDULED").length;
  const confirmed = list.filter((t) => t.tripStatus === "CONFIRMED").length;
  const finished = list.filter((t) => t.tripStatus === "FINISHED").length;

  const upcoming = list
    .filter((t) => new Date(t.departureTime).getTime() >= Date.now())
    .slice(0, 5);

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <SummaryCard icon={<Bus className="h-4 w-4" />} label="Viagens" value={total} />
        <SummaryCard icon={<Calendar className="h-4 w-4" />} label="Agendadas" value={scheduled} />
        <SummaryCard icon={<CheckCircle2 className="h-4 w-4" />} label="Confirmadas" value={confirmed} />
        <SummaryCard icon={<FileText className="h-4 w-4" />} label="Finalizadas" value={finished} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Próximas viagens</h2>
        <Link to="/admin/trips" className="text-sm text-primary">
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
            <Card key={t.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{formatDateTime(t.departureTime)}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.totalCapacity} lugares
                  </div>
                </div>
              </div>
              <Badge variant={statusVariant(t.tripStatus)}>{statusLabel(t.tripStatus)}</Badge>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </Card>
  );
}