import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, MapPin, DollarSign } from "lucide-react";
import type { TripInstance } from "@/lib/types";
import { formatDateTime, formatFullDate, statusLabel, statusVariant } from "@/lib/format";

export const Route = createFileRoute("/public/trip-instances/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da viagem" },
      { name: "description", content: "Veja os detalhes desta viagem." },
    ],
  }),
  component: PublicTripDetailPage,
});

function PublicTripDetailPage() {
  const { id } = Route.useParams();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<TripInstance>(`/public/trip-instances/${id}`, { auth: false })
      .then(setTrip)
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, [id]);

  if (error) {
    return (
      <AppShell title="Viagem" back>
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      </AppShell>
    );
  }

  if (!trip) {
    return (
      <AppShell title="Viagem" back>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  const seats = trip.availableSeats ?? trip.totalCapacity;
  const lotada = seats <= 0;

  return (
    <AppShell title="Detalhes" back>
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Saída</p>
            <p className="font-semibold capitalize">{formatFullDate(trip.departureTime)}</p>
          </div>
          <Badge variant={statusVariant(trip.tripStatus)}>{statusLabel(trip.tripStatus)}</Badge>
        </div>

        <div className="space-y-3 mb-4">
          {trip.departurePoint ? (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Origem</p>
                <p className="font-medium">{trip.departurePoint}</p>
              </div>
            </div>
          ) : null}
          {trip.destination ? (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="font-medium">{trip.destination}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <Info icon={<Calendar className="h-4 w-4" />} label="Saída">
            {formatDateTime(trip.departureTime, true)}
          </Info>
          {trip.arrivalEstimate ? (
            <Info icon={<Clock className="h-4 w-4" />} label="Chegada estimada">
              {formatDateTime(trip.arrivalEstimate, true)}
            </Info>
          ) : null}
          <Info icon={<Users className="h-4 w-4" />} label="Vagas">
            {lotada ? "Lotada" : `${seats} disponíveis`}
          </Info>
          {trip.priceOneWay != null ? (
            <Info icon={<DollarSign className="h-4 w-4" />} label="Preço">
              R$ {trip.priceOneWay.toFixed(2)}
            </Info>
          ) : null}
        </div>
      </Card>

      {isAuthenticated && trip.organizationId ? (
        <Link
          to="/_protected/trips/$orgId/$tripId"
          params={{ orgId: trip.organizationId, tripId: id }}
          className="block"
        >
          <Button className="w-full h-12 text-base" disabled={lotada}>
            {lotada ? "Viagem lotada" : "Ver detalhes e reservar"}
          </Button>
        </Link>
      ) : (
        <Link to="/login" search={{ redirect: `/public/trip-instances/${id}` }} className="block">
          <Button className="w-full h-12 text-base" disabled={lotada}>
            {lotada ? "Viagem lotada" : "Entrar para reservar"}
          </Button>
        </Link>
      )}
    </AppShell>
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
