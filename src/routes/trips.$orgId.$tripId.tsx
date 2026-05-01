import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, DollarSign, AlertCircle } from "lucide-react";
import type { TripInstance } from "@/lib/types";
import {
  canEnroll,
  formatDateTime,
  formatFullDate,
  statusLabel,
  statusVariant,
} from "@/lib/format";

export const Route = createFileRoute("/trips/$orgId/$tripId")({
  component: TripDetailPage,
});

type Availability = {
  totalCapacity?: number;
  bookedCount?: number;
  availableSeats?: number;
};

function TripDetailPage() {
  const { orgId, tripId } = Route.useParams();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripInstance | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    api<TripInstance>(`/public/trip-instances/${tripId}`, { auth: false })
      .then((res) => {
        if (!cancelled) setTrip(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          toast.error(err.message);
        }
      });
    api<Availability>(`/bookings/availability/${tripId}`)
      .then((res) => {
        if (!cancelled) setAvailability(res);
      })
      .catch(() => {
        /* opcional */
      });
    return () => {
      cancelled = true;
    };
  }, [tripId, isAuthenticated]);

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

  const seats =
    availability?.availableSeats ??
    (availability && availability.totalCapacity != null && availability.bookedCount != null
      ? availability.totalCapacity - availability.bookedCount
      : trip.totalCapacity);
  const enrollable = canEnroll(trip.tripStatus) && (seats == null || seats > 0);

  return (
    <AppShell title="Detalhes" back>
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Saída
            </p>
            <p className="font-semibold capitalize">
              {formatFullDate(trip.departureTime)}
            </p>
          </div>
          <Badge variant={statusVariant(trip.tripStatus)}>
            {statusLabel(trip.tripStatus)}
          </Badge>
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
              : `Inscrições abertas apenas para viagens agendadas ou confirmadas.`}
          </span>
        </Card>
      ) : null}

      {enrollable ? (
        <Link
          to="/trips/$orgId/$tripId/book"
          params={{ orgId, tripId }}
          className="block"
        >
          <Button className="w-full h-12 text-base">Inscrever-se</Button>
        </Link>
      ) : (
        <Button className="w-full h-12 text-base" disabled>
          Inscrições indisponíveis
        </Button>
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