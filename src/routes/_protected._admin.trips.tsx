import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useTripCreateOptions } from "@/features/trips/hooks/useTripCreateOptions";
import { AdminTripsList } from "@/features/trips/components/AdminTripsList";
import { TripStatusFilters } from "@/features/trips/components/TripStatusFilters";
import { TripFormSheet } from "@/features/trips/components/TripFormSheet";
import { DATE_RANGE_OPTIONS, isInDateRange, type DateRange } from "@/lib/date-filters";
import type { TripStatus } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/trips")({
  component: AdminTripsPage,
});

function AdminTripsPage() {
  const { adminOrgId } = useRole();
  const { trips, loading, error, refetch } = useTrips({ orgId: adminOrgId ?? "" });
  const { templates, drivers, vehicles } = useTripCreateOptions(adminOrgId);
  const [statusFilter, setStatusFilter] = useState<TripStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<DateRange>("ANY");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = trips ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((t) => {
      if (statusFilter !== "ALL" && t.tripStatus !== statusFilter) return false;
      if (!isInDateRange(t.departureTime, dateRange)) return false;
      if (q) {
        const matchesText =
          t.departurePoint?.toLowerCase().includes(q) || t.destination?.toLowerCase().includes(q);
        if (!matchesText) return false;
      }
      return true;
    });
  }, [trips, statusFilter, dateRange, search]);

  const hasTrips = (trips?.length ?? 0) > 0;
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "ALL" || dateRange !== "ANY";

  return (
    <AppShell title="Viagens" back>
      {hasTrips && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova viagem
          </Button>
        </div>
      )}

      {hasTrips && (
        <>
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por origem ou destino"
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="-mx-4 px-4 mb-2 overflow-x-auto">
            <div className="flex gap-2 pb-1 w-max">
              {DATE_RANGE_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDateRange(d.value)}
                  className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors ${
                    dateRange === d.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <TripStatusFilters value={statusFilter} onChange={setStatusFilter} />

      {loading ? (
        <LoadingList count={3} height="h-24" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : hasActiveFilters && filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          <p className="mb-3">Nenhuma viagem encontrada com os filtros atuais.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setDateRange("ANY");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <AdminTripsList trips={filtered} onCreate={() => setSheetOpen(true)} />
      )}

      <TripFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        orgId={adminOrgId}
        templates={templates}
        drivers={drivers}
        vehicles={vehicles}
        onCreated={refetch}
      />
    </AppShell>
  );
}
