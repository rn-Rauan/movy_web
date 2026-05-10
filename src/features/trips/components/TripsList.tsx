import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { TripCard } from "./TripCard";
import type { TripInstance } from "@/lib/types";

interface TripsListProps {
  trips: TripInstance[];
}

export function TripsList({ trips }: TripsListProps) {
  if (trips.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">Nenhuma viagem disponível.</Card>
    );
  }

  return (
    <ul className="space-y-3">
      {trips.map((trip) => (
        <li key={trip.id}>
          <Link to="/public/trip-instances/$id" params={{ id: trip.id }} className="block">
            <TripCard trip={trip} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
