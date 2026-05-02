import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { TripsList } from "@/features/trips/components/TripsList";

export const Route = createFileRoute("/_protected/trips/$orgId")({
  validateSearch: z.object({ slug: z.string().optional() }),
  component: TripsPage,
});

function TripsPage() {
  const { orgId } = Route.useParams();
  const { slug } = Route.useSearch();
  const { trips, loading, error } = useTrips({ orgId, slug });

  return (
    <AppShell title="Viagens" back>
      {loading ? (
        <LoadingList count={3} height="h-28" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <TripsList trips={trips ?? []} orgId={orgId} />
      )}
    </AppShell>
  );
}
