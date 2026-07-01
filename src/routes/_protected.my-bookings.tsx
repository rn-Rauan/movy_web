import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { LoginRequired } from "@/components/feedback/LoginRequired";
import { useAuth } from "@/lib/auth-context";
import { useBookings } from "@/features/bookings/hooks/useBookings";
import type { BookingStatusFilter } from "@/features/bookings/hooks/useBookings";
import { BookingsList } from "@/features/bookings/components/BookingsList";
import { FilterPillRow, type FilterPillOption } from "@/components/passenger/FilterPill";

export const Route = createFileRoute("/_protected/my-bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const location = useLocation();
  if (location.pathname !== "/my-bookings") {
    return <Outlet />;
  }
  return <MyBookingsIndex />;
}

function MyBookingsIndex() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <AppShell title="Minhas inscrições">
        <LoginRequired message="Entre na sua conta para ver suas inscrições." />
      </AppShell>
    );
  }
  return <MyBookingsContent />;
}

function MyBookingsContent() {
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

  const statusOptions = useMemo<FilterPillOption<BookingStatusFilter>[]>(() => {
    const list = bookings ?? [];
    return [
      { value: "ALL", label: "Todas", count: list.length },
      {
        value: "ACTIVE",
        label: "Ativas",
        count: list.filter((b) => b.status === "ACTIVE").length,
      },
      {
        value: "INACTIVE",
        label: "Canceladas",
        count: list.filter((b) => b.status === "INACTIVE").length,
      },
    ];
  }, [bookings]);

  return (
    <AppShell title="Minhas inscrições">
      {hasBookings && (
        <div className="-mx-4 -mt-3.5 mb-3 border-b border-line bg-background px-4 py-3">
          <div className="relative mb-2.5">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.6}
            />
            <Input
              placeholder="Buscar por origem, destino ou empresa"
              className="h-10 rounded-[11px] border-line bg-surface pl-9 text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterPillRow options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
        </div>
      )}

      {loading ? (
        <LoadingList count={2} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : hasActiveFilters && filtered.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-surface p-6 text-center text-[13px] text-muted-foreground">
          <p className="mb-3">Nenhuma inscrição encontrada com os filtros atuais.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="rounded-full border-line"
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <BookingsList bookings={hasBookings ? filtered : []} />
      )}
    </AppShell>
  );
}
