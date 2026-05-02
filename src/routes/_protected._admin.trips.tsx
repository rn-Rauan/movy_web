import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingList } from "@/components/feedback/LoadingList";
import { useRole } from "@/lib/role-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { TripStatus } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/trips")({
  component: AdminTripsPage,
});

const FILTERS: { label: string; value: TripStatus | "ALL" }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Rascunho", value: "DRAFT" },
  { label: "Agendada", value: "SCHEDULED" },
  { label: "Confirmada", value: "CONFIRMED" },
  { label: "Cancelada", value: "CANCELED" },
  { label: "Finalizada", value: "FINISHED" },
];

function AdminTripsPage() {
  const { adminOrgId } = useRole();
  const { trips, loading } = useTrips({ orgId: adminOrgId ?? "" });
  const [filter, setFilter] = useState<TripStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const list = (trips ?? []).filter((t) => {
    if (filter !== "ALL" && t.tripStatus !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (t.departurePoint ?? "").toLowerCase().includes(q) ||
        (t.destination ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell title="Viagens">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{list.length} viagens</p>
        <Button size="sm" disabled>
          <Plus className="h-4 w-4 mr-1" />
          Criar viagem
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por origem ou destino"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingList count={4} height="h-20" />
      ) : list.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhuma viagem encontrada.
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-sm font-semibold">
                  {formatDateTime(t.departureTime)}
                </div>
                <Badge variant={statusVariant(t.tripStatus)}>
                  {statusLabel(t.tripStatus)}
                </Badge>
              </div>
              {(t.departurePoint || t.destination) && (
                <div className="text-sm text-muted-foreground mb-2">
                  {t.departurePoint ?? "—"} → {t.destination ?? "—"}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.totalCapacity} lugares</span>
                <Button variant="ghost" size="sm" disabled>
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}