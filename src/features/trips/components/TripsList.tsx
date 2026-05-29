import { PublicTripCard } from "./PublicTripCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { TripInstance } from "@/lib/types";

interface TripsListProps {
  trips: TripInstance[];
}

export function TripsList({ trips }: TripsListProps) {
  if (trips.length === 0) {
    return (
      <EmptyState
        variant="trips"
        title="Nenhuma viagem disponível"
        description="Esta empresa ainda não tem viagens públicas."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {trips.map((trip) => (
        <li key={trip.id}>
          <PublicTripCard trip={trip} />
        </li>
      ))}
    </ul>
  );
}
