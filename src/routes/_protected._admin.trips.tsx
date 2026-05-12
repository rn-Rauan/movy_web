import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useTripCreateOptions } from "@/features/trips/hooks/useTripCreateOptions";
import { AdminTripsList } from "@/features/trips/components/AdminTripsList";
import { TripStatusFilters } from "@/features/trips/components/TripStatusFilters";
import { TripFormSheet } from "@/features/trips/components/TripFormSheet";
import type { TripStatus } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/trips")({
  component: AdminTripsPage,
});

function AdminTripsPage() {
  const { adminOrgId } = useRole();
  const { trips, loading, error, refetch } = useTrips({ orgId: adminOrgId ?? "" });
  const { templates, drivers, vehicles } = useTripCreateOptions(adminOrgId);
  const [filter, setFilter] = useState<TripStatus | "ALL">("ALL");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = trips ?? [];
    return filter === "ALL" ? list : list.filter((t) => t.tripStatus === filter);
  }, [trips, filter]);

  const hasTrips = (trips?.length ?? 0) > 0;

  return (
    <AppShell title="Viagens" back>
      {hasTrips && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova viagem
          </Button>
        </div>
      )}

      <TripStatusFilters value={filter} onChange={setFilter} />

      {loading ? (
        <LoadingList count={3} height="h-24" />
      ) : error ? (
        <ErrorCard message={error} />
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
