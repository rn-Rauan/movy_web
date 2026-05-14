import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowUpDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ContextBanner } from "@/components/layout/ContextBanner";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePublicTrips } from "@/features/trips/hooks/usePublicTrips";
import type { Shift, SortBy } from "@/features/trips/hooks/usePublicTrips";
import { DATE_RANGE_OPTIONS } from "@/lib/date-filters";
import { PublicTripCard } from "@/features/trips/components/PublicTripCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";

const SHIFTS: { value: Shift; label: string }[] = [
  { value: "ALL", label: "Todos turnos" },
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
  const { isAuthenticated } = useAuth();

  return (
    <AppShell title="Viagens">
      <ContextBanner variant="public" />

      {!isAuthenticated ? (
        <div className="mb-4 flex justify-end">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
        </div>
      ) : null}

      <div className="relative mb-3">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar origem, destino ou empresa"
          className="pl-9 h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="-mx-4 px-4 mb-2 overflow-x-auto">
        <div className="flex gap-2 pb-1 w-max">
          {DATE_RANGE_OPTIONS.map((d) => (
            <FilterPill
              key={d.value}
              active={dateRange === d.value}
              onClick={() => setDateRange(d.value)}
            >
              {d.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="-mx-4 px-4 mb-4 overflow-x-auto">
        <div className="flex gap-2 pb-1 w-max">
          {SHIFTS.map((s) => (
            <FilterPill key={s.value} active={shift === s.value} onClick={() => setShift(s.value)}>
              {s.label}
            </FilterPill>
          ))}
        </div>
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
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "viagem encontrada" : "viagens encontradas"}
            </p>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-auto h-9 gap-1.5 text-xs px-3">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
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
          <ul className="space-y-3">
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
