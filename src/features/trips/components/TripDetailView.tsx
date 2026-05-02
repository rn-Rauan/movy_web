import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, DollarSign, AlertCircle } from "lucide-react";
import type { TripInstance, BookingAvailability } from "@/lib/types";
import {
  canEnroll,
  formatDateTime,
  formatFullDate,
  statusLabel,
  statusVariant,
} from "@/lib/format";

interface TripDetailViewProps {
  trip: TripInstance;
  availability: BookingAvailability | null;
  orgId: string;
}

export function TripDetailView({ trip, availability, orgId }: TripDetailViewProps) {
  const seats = availability?.availableSlots ?? trip.totalCapacity;
  const enrollable =
    availability?.isBookable ?? (canEnroll(trip.tripStatus) && (seats == null || seats > 0));

  return (
    <>
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Saída</p>
            <p className="font-semibold capitalize">{formatFullDate(trip.departureTime)}</p>
          </div>
          <Badge variant={statusVariant(trip.tripStatus)}>{statusLabel(trip.tripStatus)}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Info icon={<Calendar className="h-4 w-4" />} label="Saída">
            {formatDateTime(trip.departureTime, true)}
          </Info>
          {trip.arrivalEstimate ? (
            <Info icon={<Clock className="h-4 w-4" />} label="Chegada estimada">
              {formatDateTime(trip.arrivalEstimate, true)}
            </Info>
          ) : null}
          <Info icon={<Users className="h-4 w-4" />} label="Vagas">
            {seats != null ? `${seats} de ${trip.totalCapacity}` : `${trip.totalCapacity}`}
          </Info>
          {trip.minRevenue != null ? (
            <Info icon={<DollarSign className="h-4 w-4" />} label="Preço mínimo">
              R$ {trip.minRevenue.toFixed(2)}
            </Info>
          ) : null}
        </div>
      </Card>

      {!enrollable ? (
        <Card className="p-4 mb-4 flex gap-2 text-sm bg-muted">
          <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">
            {seats != null && seats <= 0
              ? "Esta viagem está lotada."
              : "Inscrições abertas apenas para viagens agendadas ou confirmadas."}
          </span>
        </Card>
      ) : null}

      {enrollable ? (
        <Link
          to="/trips/$orgId/$tripId/book"
          params={{ orgId, tripId: trip.id }}
          className="block"
        >
          <Button className="w-full h-12 text-base">Inscrever-se</Button>
        </Link>
      ) : (
        <Button className="w-full h-12 text-base" disabled>
          Inscrições indisponíveis
        </Button>
      )}
    </>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="font-medium mt-0.5">{children}</p>
    </div>
  );
}
