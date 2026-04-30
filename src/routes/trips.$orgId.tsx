import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, ChevronRight } from "lucide-react";
import type { TripInstance } from "@/lib/types";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";

export const Route = createFileRoute("/trips/$orgId")({
  component: TripsPage,
});

function TripsPage() {
  const { orgId } = Route.useParams();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    api<TripInstance[] | { data: TripInstance[] }>(
      `/trip-instances/organization/${orgId}`
    )
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res.data ?? [];
        const sorted = [...list].sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime()
        );
        setTrips(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        toast.error(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, isAuthenticated]);

  return (
    <AppShell title="Viagens" back>
      {trips === null && !error ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      ) : trips && trips.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          Nenhuma viagem disponível.
        </Card>
      ) : (
        <ul className="space-y-3">
          {trips!.map((trip) => {
            const seats =
              trip.availableSeats ??
              (trip.totalCapacity != null && trip.bookedCount != null
                ? trip.totalCapacity - trip.bookedCount
                : null);
            return (
              <li key={trip.id}>
                <Link
                  to="/trips/$orgId/$tripId"
                  params={{ orgId, tripId: trip.id }}
                  className="block"
                >
                  <Card className="p-4 active:bg-accent transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Calendar className="h-4 w-4 text-primary" />
                        {formatDateTime(trip.departureTime)}
                      </div>
                      <Badge variant={statusVariant(trip.tripStatus)}>
                        {statusLabel(trip.tripStatus)}
                      </Badge>
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
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}