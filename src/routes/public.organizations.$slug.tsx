import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, Users, MapPin } from "lucide-react";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { TripInstance, Paginated } from "@/lib/types";

type PublicOrgTrip = TripInstance & { organizationName?: string };

export const Route = createFileRoute("/public/organizations/$slug")({
  head: () => ({
    meta: [
      { title: "Empresa de transporte" },
      { name: "description", content: "Veja as viagens disponíveis desta empresa." },
    ],
  }),
  component: PublicOrgPage,
});

function PublicOrgPage() {
  const { slug } = Route.useParams();
  const [trips, setTrips] = useState<PublicOrgTrip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Paginated<PublicOrgTrip>>(`/public/trip-instances/org/${slug}`, { auth: false })
      .then((res) => setTrips(Array.isArray(res) ? res : (res.data ?? [])))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, [slug]);

  const orgName = (trips && trips.length > 0 && trips[0].organizationName) || slug;

  return (
    <AppShell title="Empresa" back>
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg leading-tight">{orgName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">@{slug}</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Próximas viagens</h3>
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Entrar para reservar
          </Button>
        </Link>
      </div>

      {trips === null && !error ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      ) : trips && trips.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma viagem disponível para esta empresa.
        </Card>
      ) : (
        <ul className="space-y-3">
          {trips!.map((trip) => {
            const seats = trip.availableSeats ?? 0;
            const lotada = seats <= 0;
            return (
              <li key={trip.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDateTime(trip.departureTime)}
                    </div>
                    <Badge variant={statusVariant(trip.tripStatus)}>
                      {statusLabel(trip.tripStatus)}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{trip.departurePoint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {lotada ? "Lotada" : `${seats} vagas`}
                    </span>
                    {trip.priceOneWay != null ? (
                      <span className="font-semibold">R$ {trip.priceOneWay.toFixed(2)}</span>
                    ) : null}
                  </div>

                  <Link
                    to="/public/trip-instances/$id"
                    params={{ id: trip.id }}
                    className="block mt-3"
                  >
                    <Button className="w-full h-10" disabled={lotada}>
                      {lotada ? "Lotada" : "Ver viagem"}
                    </Button>
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
