import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { TripCard } from "./TripCard";
import type { TripInstance } from "@/lib/types";

interface TripsListProps {
  trips: TripInstance[];
  orgId: string;
}

export function TripsList({ trips, orgId }: TripsListProps) {
  if (trips.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">Nenhuma viagem disponível.</Card>
    );
  }

  return (
    <ul className="space-y-3">
      {trips.map((trip) => (
        <li key={trip.id}>
          <Link
            to="/trips/$orgId/$tripId"
            params={{ orgId, tripId: trip.id }}
            className="block"
          >
            <TripCard trip={trip} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
