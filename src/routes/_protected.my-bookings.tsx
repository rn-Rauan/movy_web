import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useBookings } from "@/features/bookings/hooks/useBookings";
import type { BookingStatusFilter } from "@/features/bookings/hooks/useBookings";
import { BookingsList } from "@/features/bookings/components/BookingsList";

export const Route = createFileRoute("/_protected/my-bookings")({
  component: MyBookingsPage,
});

const STATUS_OPTIONS: { value: BookingStatusFilter; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "ACTIVE", label: "Ativas" },
  { value: "INACTIVE", label: "Canceladas" },
];

function MyBookingsPage() {
  const {
    bookings,
    filtered,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    resetFilters,
    hasActiveFilters,
    loading,
    error,
  } = useBookings();

  const hasBookings = (bookings?.length ?? 0) > 0;

  return (
    <AppShell title="Minhas inscrições">
      {hasBookings && (
        <>
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por origem, destino ou empresa"
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="-mx-4 px-4 mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-1 w-max">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatusFilter(s.value)}
                  className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === s.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {loading ? (
        <LoadingList count={2} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : hasActiveFilters && filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          <p className="mb-3">Nenhuma inscrição encontrada com os filtros atuais.</p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <BookingsList bookings={hasBookings ? filtered : []} />
      )}
    </AppShell>
  );
}
