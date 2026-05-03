import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ContextBanner } from "@/components/layout/ContextBanner";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Users, MapPin, Mail, Phone } from "lucide-react";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { organizationsService } from "@/services/organizations.service";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import type { Organization } from "@/lib/types";

type Shift = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";
const SHIFTS: { value: Shift; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
];
function shiftOf(iso: string): Exclude<Shift, "ALL"> {
  const h = new Date(iso).getUTCHours();
  if (h < 12) return "MORNING";
  if (h < 18) return "AFTERNOON";
  return "EVENING";
}

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
  const { trips, loading, error } = useTrips({ orgId: "", slug });
  const [org, setOrg] = useState<Organization | null>(null);
  const [shift, setShift] = useState<Shift>("ALL");

  useEffect(() => {
    let cancelled = false;
    organizationsService.getBySlug(slug).then(
      (res) => { if (!cancelled) setOrg(res); },
      () => {},
    );
    return () => { cancelled = true; };
  }, [slug]);

  const orgName = org?.name || (trips && trips.length > 0 && trips[0].organizationName) || slug;
  const visible = useMemo(
    () =>
      shift === "ALL"
        ? trips ?? []
        : (trips ?? []).filter((t) => shiftOf(t.departureTime) === shift),
    [trips, shift],
  );
  const contactHref = org?.email ? `mailto:${org.email}` : org?.telephone ? `tel:${org.telephone}` : undefined;

  return (
    <AppShell title="Empresa" back>
      <ContextBanner variant="org" orgName={orgName} slug={slug} />

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

        {(org?.email || org?.telephone || org?.address) ? (
          <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
            {org?.address ? (
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{org.address}</p>
            ) : null}
            {org?.email ? (
              <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{org.email}</span></p>
            ) : null}
            {org?.telephone ? (
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{org.telephone}</p>
            ) : null}
          </div>
        ) : null}

        {contactHref ? (
          <a href={contactHref} className="block mt-3">
            <Button variant="outline" className="w-full h-10">Entrar em contato</Button>
          </a>
        ) : null}
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Próximas viagens</h3>
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Entrar para reservar
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SHIFTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setShift(s.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              shift === s.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingList count={2} height="h-36" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma viagem disponível com esses filtros.
        </Card>
      ) : (
        <ul className="space-y-3">
          {visible.map((trip) => {
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
