import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useTripPassengers } from "@/features/trips/hooks/useTripPassengers";
import { TripDetailView } from "@/features/trips/components/TripDetailView";

export const Route = createFileRoute("/_protected/trips/$orgId/$tripId")({
  component: TripDetailPage,
});

function TripDetailPage() {
  const { orgId, tripId } = Route.useParams();
  const { trip, availability, loading, error } = useTripDetail(tripId);
  const { passengers } = useTripPassengers(tripId);

  return (
    <AppShell title="Detalhes" back>
      {loading ? (
        <LoadingList count={3} height="h-32" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : trip ? (
        <TripDetailView
          trip={trip}
          availability={availability}
          orgId={orgId}
          passengers={passengers}
        />
      ) : null}
    </AppShell>
  );
}
