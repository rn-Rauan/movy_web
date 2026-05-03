import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, ChevronRight } from "lucide-react";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { PublicTrip } from "../hooks/usePublicTrips";

interface PublicTripCardProps {
  trip: PublicTrip;
}

export function PublicTripCard({ trip }: PublicTripCardProps) {
  const seats = trip.availableSeats ?? trip.totalCapacity;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-primary">{trip.organizationName}</p>
        <Badge variant={statusVariant(trip.tripStatus)}>{statusLabel(trip.tripStatus)}</Badge>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{trip.departurePoint}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium truncate">{trip.destination}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateTime(trip.departureTime)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {seats} vagas
        </span>
        {trip.priceOneWay != null ? (
          <span className="font-semibold text-foreground">
            a partir de R$ {trip.priceOneWay.toFixed(2)}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {trip.organizationSlug ? (
          <Link to="/public/organizations/$slug" params={{ slug: trip.organizationSlug }}>
            <Button variant="outline" className="w-full h-10">
              Ver empresa
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="w-full h-10" disabled>
            Ver empresa
          </Button>
        )}
        <Link to="/public/trip-instances/$id" params={{ id: trip.id }}>
          <Button className="w-full h-10">
            Ver viagem
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
