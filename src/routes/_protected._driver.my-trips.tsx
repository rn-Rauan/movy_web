import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TripCard } from "@/features/trips/components/TripCard";
import { useDriverTrips } from "@/features/trips/hooks/useDriverTrips";

export const Route = createFileRoute("/_protected/_driver/my-trips")({
  component: DriverTripsPage,
});

function DriverTripsPage() {
  const { trips, loading, error } = useDriverTrips();

  return (
    <AppShell title="Como motorista">
      <p className="text-sm text-muted-foreground mb-3">
        Viagens em que você está designado como motorista.
      </p>
      {loading ? (
        <LoadingList count={3} height="h-24" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : !trips || trips.length === 0 ? (
        <EmptyState
          variant="trips"
          title="Nenhuma viagem atribuída"
          description="Quando um administrador atribuir uma viagem a você, ela aparecerá aqui."
        />
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link to="/trip/$tripId" params={{ tripId: trip.id }} className="block">
                <TripCard trip={trip} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
