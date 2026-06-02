import { createFileRoute } from "@tanstack/react-router";
import { Search, ArrowUpDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePublicTrips } from "@/features/trips/hooks/usePublicTrips";
import type { Shift, SortBy } from "@/features/trips/hooks/usePublicTrips";
import { DATE_RANGE_OPTIONS, type DateRange } from "@/lib/date-filters";
import { PublicTripCard } from "@/features/trips/components/PublicTripCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentFilter, type SegmentOption } from "@/components/passenger/SegmentFilter";

const DATE_SEGMENTS: SegmentOption<DateRange>[] = DATE_RANGE_OPTIONS.map((d) => ({
  value: d.value,
  label: d.value === "ANY" ? "Qualquer" : d.value === "THIS_WEEK" ? "Esta sem." : d.label,
}));

const SHIFT_SEGMENTS: SegmentOption<Shift>[] = [
  { value: "ALL", label: "Todos" },
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "DEPARTURE_ASC", label: "Mais próxima" },
  { value: "DEPARTURE_DESC", label: "Mais distante" },
  { value: "PRICE_ASC", label: "Menor preço" },
  { value: "PRICE_DESC", label: "Maior preço" },
];

export const Route = createFileRoute("/public/trip-instances/")({
  head: () => ({
    meta: [
      { title: "Viagens disponíveis" },
      { name: "description", content: "Veja todas as viagens públicas disponíveis." },
    ],
  }),
  component: PublicTripsPage,
});

function PublicTripsPage() {
  const {
    filtered,
    search,
    setSearch,
    shift,
    setShift,
    dateRange,
    setDateRange,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    loading,
    error,
  } = usePublicTrips();

  return (
    <AppShell title="Explorar">
      <div className="-mx-4 -mt-3.5 mb-3 border-b border-line bg-background px-4 py-3">
        <div className="relative mb-2.5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.6}
          />
          <Input
            placeholder="Origem, destino ou empresa"
            className="h-10 rounded-[11px] border-line bg-surface pl-9 text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <SegmentFilter options={DATE_SEGMENTS} value={dateRange} onChange={setDateRange} />
        <div className="h-1.5" />
        <SegmentFilter options={SHIFT_SEGMENTS} value={shift} onChange={setShift} />
      </div>

      {loading ? (
        <LoadingList count={3} height="h-40" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="search"
          title="Nenhuma viagem encontrada"
          description="Tente ajustar a busca ou ver todos os turnos disponíveis."
          action={hasActiveFilters ? { label: "Limpar filtros", onClick: resetFilters } : undefined}
        />
      ) : (
        <>
          <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
            <span className="text-[12px] font-semibold text-muted-foreground">
              <span className="font-bold text-ink">
                {filtered.length} {filtered.length === 1 ? "viagem" : "viagens"}
              </span>{" "}
              {filtered.length === 1 ? "encontrada" : "encontradas"}
            </span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="h-8 w-auto justify-start gap-1.5 rounded-full border-line bg-surface px-2.5 text-[11px] font-bold text-ink-2">
                <ArrowUpDown className="h-3 w-3" strokeWidth={1.6} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ul className="flex flex-col gap-2">
            {filtered.map((trip) => (
              <li key={trip.id}>
                <PublicTripCard trip={trip} />
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
