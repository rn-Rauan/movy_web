import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Users, MapPin, Phone, Mail, Globe } from "lucide-react";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";

export const Route = createFileRoute("/public/organizations/$slug")({
  head: () => ({
    meta: [
      { title: "Empresa de transporte" },
      { name: "description", content: "Veja as viagens disponíveis desta empresa." },
    ],
  }),
  component: PublicOrgPage,
});

const MOCK_ORG = {
  name: "Trans Alpha",
  description: "Transporte regional confiável desde 2010. Atendendo o interior de SP com pontualidade.",
  phone: "(11) 99999-0000",
  email: "contato@transalpha.com.br",
  website: "transalpha.com.br",
};

const MOCK_TRIPS = [
  {
    id: "trip-1",
    tripStatus: "SCHEDULED" as const,
    totalCapacity: 40,
    availableSeats: 12,
    departureTime: "2026-05-10T07:30:00.000Z",
    origin: "São Paulo - SP",
    destination: "Campinas - SP",
    price: 49.9,
  },
  {
    id: "trip-3",
    tripStatus: "SCHEDULED" as const,
    totalCapacity: 50,
    availableSeats: 0,
    departureTime: "2026-05-15T06:00:00.000Z",
    origin: "São Paulo - SP",
    destination: "Santos - SP",
    price: 39.9,
  },
];

function PublicOrgPage() {
  const { slug } = Route.useParams();

  return (
    <AppShell title="Empresa" back showTabs={false}>
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg leading-tight">{MOCK_ORG.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">@{slug}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{MOCK_ORG.description}</p>

        <div className="space-y-2 text-sm border-t pt-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{MOCK_ORG.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{MOCK_ORG.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{MOCK_ORG.website}</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Próximas viagens</h3>
        <Link to="/login">
          <Button variant="ghost" size="sm">Entrar para reservar</Button>
        </Link>
      </div>

      <ul className="space-y-3">
        {MOCK_TRIPS.map((trip) => {
          const seats = trip.availableSeats;
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
                    <span className="truncate">{trip.origin}</span>
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
                  {trip.price != null ? (
                    <span className="font-semibold">R$ {trip.price.toFixed(2)}</span>
                  ) : null}
                </div>

                <Link to="/login" className="block mt-3">
                  <Button className="w-full h-10" disabled={lotada}>
                    {lotada ? "Lotada" : "Ver viagem"}
                  </Button>
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}