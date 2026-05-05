import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";
import type { TripInstance } from "@/lib/types";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";

interface TripCardProps {
  trip: TripInstance;
}

export function TripCard({ trip }: TripCardProps) {
  const seats =
    trip.availableSlots ??
    (trip.totalCapacity != null && trip.bookedCount != null
      ? trip.totalCapacity - trip.bookedCount
      : null);

  return (
    <Card className="p-4 active:bg-accent transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4 text-primary" />
          {formatDateTime(trip.departureTime)}
        </div>
        <Badge variant={statusVariant(trip.tripStatus)}>{statusLabel(trip.tripStatus)}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {seats != null ? `${seats} vagas` : `${trip.totalCapacity} lugares`}
        </span>
        {trip.arrivalEstimate ? (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            chega {formatDateTime(trip.arrivalEstimate, true)}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
