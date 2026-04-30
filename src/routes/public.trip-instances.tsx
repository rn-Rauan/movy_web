import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { TripInstance } from "@/lib/types";

export const Route = createFileRoute("/public/trip-instances")({
  head: () => ({
    meta: [
      { title: "Viagens disponíveis" },
      { name: "description", content: "Veja todas as viagens públicas disponíveis." },
    ],
  }),
  component: PublicTripsPage,
});

const MOCK_TRIPS: (TripInstance & { organizationName: string; organizationSlug: string; origin: string; destination: string })[] = [
  {
    id: "trip-1",
    organizationId: "org-1",
    organizationName: "Trans Alpha",
    organizationSlug: "trans-alpha",
    tripTemplateId: "tpl-1",
    tripStatus: "SCHEDULED",
    totalCapacity: 40,
    availableSeats: 12,
    departureTime: "2026-05-10T07:30:00.000Z",
    arrivalEstimate: "2026-05-10T10:00:00.000Z",
    origin: "São Paulo - SP",
    destination: "Campinas - SP",
    price: 49.9,
  },
  {
    id: "trip-2",
    organizationId: "org-2",
    organizationName: "Beta Tour",
    organizationSlug: "beta-tour",
    tripTemplateId: "tpl-2",
    tripStatus: "CONFIRMED",
    totalCapacity: 30,
    availableSeats: 4,
    departureTime: "2026-05-12T18:00:00.000Z",
    arrivalEstimate: "2026-05-12T22:30:00.000Z",
    origin: "Rio de Janeiro - RJ",
    destination: "Belo Horizonte - MG",
    price: 89.0,
  },
  {
    id: "trip-3",
    organizationId: "org-1",
    organizationName: "Trans Alpha",
    organizationSlug: "trans-alpha",
    tripTemplateId: "tpl-3",
    tripStatus: "SCHEDULED",
    totalCapacity: 50,
    availableSeats: 0,
    departureTime: "2026-05-15T06:00:00.000Z",
    arrivalEstimate: "2026-05-15T09:30:00.000Z",
    origin: "São Paulo - SP",
    destination: "Santos - SP",
    price: 39.9,
  },
];

function PublicTripsPage() {
  return (
    <AppShell title="Viagens" showTabs={false}>
      <div className="mb-4 flex justify-end">
        <Link to="/login">
          <Button variant="outline" size="sm">Entrar</Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar origem ou destino" className="pl-9 h-11" />
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {MOCK_TRIPS.length} viagens encontradas
      </p>

      <ul className="space-y-3">
        {MOCK_TRIPS.map((trip) => {
          const seats = trip.availableSeats ?? trip.totalCapacity;
          return (
            <li key={trip.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-xs font-medium text-primary">
                    {trip.organizationName}
                  </p>
                  <Badge variant={statusVariant(trip.tripStatus)}>
                    {statusLabel(trip.tripStatus)}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{trip.origin}</span>
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
                  {trip.price != null ? (
                    <span className="font-semibold text-foreground">
                      R$ {trip.price.toFixed(2)}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Link
                    to="/public/organizations/$slug"
                    params={{ slug: trip.organizationSlug }}
                  >
                    <Button variant="outline" className="w-full h-10">
                      Ver empresa
                    </Button>
                  </Link>
                  <Link to="/login">
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
    </AppShell>
  );
}