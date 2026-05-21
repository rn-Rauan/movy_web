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
import { cn } from "@/lib/utils";

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

  // Counts por status para o filtro (respeita search + dateRange, ignora statusFilter atual)
  const counts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = (trips ?? []).filter((t) => {
      if (!isInDateRange(t.departureTime, dateRange)) return false;
      if (q) {
        const m =
          t.departurePoint?.toLowerCase().includes(q) || t.destination?.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
    const c: Partial<Record<TripStatus | "ALL", number>> = { ALL: base.length };
    for (const t of base) {
      c[t.tripStatus] = (c[t.tripStatus] ?? 0) + 1;
    }
    return c;
  }, [trips, search, dateRange]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (trips ?? []).filter((t) => {
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
    <AppShell
      title="Viagens"
      back
      action={
        hasTrips ? (
          <button
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Nova
          </button>
        ) : null
      }
    >
      {hasTrips && (
        <>
          {/* Search */}
          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.8}
            />
            <Input
              placeholder="Buscar por origem ou destino"
              className="h-11 rounded-xl border-line bg-surface pl-9 text-[14px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date filter segmented */}
          <div className="-mx-4 mb-3 overflow-x-auto px-4">
            <div className="flex w-max gap-1.5 pb-1">
              {DATE_RANGE_OPTIONS.map((d) => {
                const active = dateRange === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDateRange(d.value)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors",
                      active
                        ? "bg-accent text-white"
                        : "border border-line bg-surface text-ink-2 hover:bg-surface-2",
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <TripStatusFilters value={statusFilter} onChange={setStatusFilter} counts={counts} />

      {loading ? (
        <LoadingList count={3} height="h-24" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : hasActiveFilters && filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-4 py-10 text-center text-sm text-muted-foreground">
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
