import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
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

/** Labels curtos pro segmented control de data (cabem nas 5 abas equilibradas). */
const DATE_SHORT: Record<DateRange, string> = {
  ANY: "Qualquer",
  TODAY: "Hoje",
  TOMORROW: "Amanhã",
  THIS_WEEK: "Esta sem.",
  NEXT_WEEK: "Próx. sem.",
};

/** Label do header de seção conforme o filtro de data ativo. */
const RANGE_LABEL: Record<DateRange, string> = {
  ANY: "Todas",
  TODAY: "Hoje",
  TOMORROW: "Amanhã",
  THIS_WEEK: "Esta semana",
  NEXT_WEEK: "Próxima semana",
};

function AdminTripsPage() {
  const { adminOrgId } = useRole();
  const { trips, loading, error, refetch } = useTrips({ orgId: adminOrgId ?? "" });
  const { templates, drivers, vehicles } = useTripCreateOptions(adminOrgId);
  const [statusFilter, setStatusFilter] = useState<TripStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<DateRange>("ANY");
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
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

  // Ordenação por data de partida. "Recentes" = mais recentes primeiro (desc).
  const sorted = useMemo(() => {
    const arr = [...filtered].sort(
      (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
    );
    return sortDesc ? arr.reverse() : arr;
  }, [filtered, sortDesc]);

  const hasTrips = (trips?.length ?? 0) > 0;
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "ALL" || dateRange !== "ANY";

  return (
    <AppShell
      title="Viagens"
      back
      action={
        <button
          onClick={() => setSheetOpen(true)}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Nova
        </button>
      }
    >
      {hasTrips && (
        <>
          {/* Search */}
          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.8}
            />
            <Input
              placeholder="Buscar por origem ou destino"
              className="h-11 rounded-xl border-line bg-surface pl-10 text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date segmented control */}
          <div className="mb-2.5 flex gap-1 rounded-xl border border-line bg-surface-2 p-[3px]">
            {DATE_RANGE_OPTIONS.map((d) => {
              const active = dateRange === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDateRange(d.value)}
                  className={cn(
                    "flex-1 rounded-[9px] px-1 py-1.5 text-[11px] transition-colors",
                    active
                      ? "bg-surface font-bold text-ink shadow-sm"
                      : "font-medium text-muted-foreground",
                  )}
                >
                  {DATE_SHORT[d.value]}
                </button>
              );
            })}
          </div>

          {/* Status chips */}
          <TripStatusFilters value={statusFilter} onChange={setStatusFilter} counts={counts} />

          {/* Section header */}
          <div className="mb-2.5 flex items-baseline justify-between px-0.5">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
              {RANGE_LABEL[dateRange]} · {sorted.length}
            </h2>
            <button
              type="button"
              onClick={() => setSortDesc((v) => !v)}
              className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-ink-2"
            >
              {sortDesc ? "Recentes" : "Antigas"}
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", !sortDesc && "rotate-180")}
                strokeWidth={1.8}
              />
            </button>
          </div>
        </>
      )}

      {loading ? (
        <LoadingList count={3} height="h-24" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : hasActiveFilters && sorted.length === 0 ? (
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
        <AdminTripsList trips={sorted} onCreate={() => setSheetOpen(true)} />
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
