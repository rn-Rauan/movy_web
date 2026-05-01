import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, MapPin, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { TripInstance, Paginated } from "@/lib/types";

type PublicTrip = TripInstance & {
  organizationName?: string;
  organizationSlug?: string;
};

export const Route = createFileRoute("/public/trip-instances/")({
  head: () => ({
    meta: [
      { title: "Viagens disponíveis" },
      { name: "description", content: "Veja todas as viagens públicas disponíveis." },
    ],
  }),
  component: PublicTripsPage,
});

function PublicTripsPage() {
  const [trips, setTrips] = useState<PublicTrip[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Paginated<PublicTrip>>("/public/trip-instances", { auth: false })
      .then((res) => setTrips(Array.isArray(res) ? res : (res.data ?? [])))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, []);

  const filtered = (trips ?? []).filter((t) => {
    const q = search.toLowerCase();
    return (
      !q ||
      t.departurePoint?.toLowerCase().includes(q) ||
      t.destination?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell title="Viagens" showTabs={false}>
      <div className="mb-4 flex justify-end">
        <Link to="/login">
          <Button variant="outline" size="sm">
            Entrar
          </Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar origem ou destino"
          className="pl-9 h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {trips === null && !error ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            {filtered.length} viagens encontradas
          </p>
          <ul className="space-y-3">
            {filtered.map((trip) => {
              const seats = trip.availableSeats ?? trip.totalCapacity;
              return (
                <li key={trip.id}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-xs font-medium text-primary">{trip.organizationName}</p>
                      <Badge variant={statusVariant(trip.tripStatus)}>
                        {statusLabel(trip.tripStatus)}
                      </Badge>
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
                        <Link
                          to="/public/organizations/$slug"
                          params={{ slug: trip.organizationSlug }}
                        >
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
                </li>
              );
            })}
          </ul>
        </>
      )}
    </AppShell>
  );
}
