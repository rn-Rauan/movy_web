import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  ChevronRight,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useAuth } from "@/lib/auth-context";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useTripDates } from "@/features/trips/hooks/useTripDates";
import { useUserBookingForTrip } from "@/features/bookings/hooks/useUserBookingForTrip";
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import { formatDateTime, formatFullDate } from "@/lib/format";
import { BR_TZ } from "@/lib/timezone";
import { ShareButton } from "@/components/ShareButton";
import { StatusPill } from "@/components/passenger/StatusPill";
import { RouteVisualTimeline } from "@/components/passenger/RouteVisualTimeline";
import { MetadataRow, type MetadataItem } from "@/components/passenger/MetadataRow";

export const Route = createFileRoute("/public/trip-instances/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da viagem" },
      { name: "description", content: "Veja os detalhes desta viagem." },
    ],
  }),
  component: PublicTripDetailPage,
});

function formatChipDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      timeZone: BR_TZ,
    })
    .replace(".", "");
}

function durationLabel(departure: string, arrival?: string): string | null {
  if (!arrival) return null;
  const d = new Date(departure).getTime();
  const a = new Date(arrival).getTime();
  if (Number.isNaN(d) || Number.isNaN(a) || a <= d) return null;
  const mins = Math.round((a - d) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function PublicTripDetailPage() {
  const { id } = Route.useParams();
  const { isAuthenticated } = useAuth();
  const { trip, availability, loading, error } = useTripDetail(id);
  const tripDates = useTripDates({
    organizationId: trip?.organizationId,
    templateId: trip?.tripTemplateId,
    enabled: !!trip?.tripTemplateId,
  });
  const { booking: existingBooking } = useUserBookingForTrip(isAuthenticated ? id : undefined);
  const { name: driverName } = useDriverName(isAuthenticated ? trip?.driverId : null);

  return (
    <AppShell
      title="Detalhes"
      back
      action={
        trip && (
          <ShareButton
            title="Viagem disponível"
            text={
              trip.departurePoint && trip.destination
                ? `${trip.departurePoint} → ${trip.destination}`
                : "Confira esta viagem"
            }
            url={`/public/trip-instances/${id}`}
            variant="outline"
            size="sm"
          />
        )
      }
    >
      {loading ? (
        <LoadingList count={3} height="h-32" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : !trip ? null : (
        <>
          <div className="pb-32">
            <article className="mb-3 rounded-2xl border border-line bg-surface p-4">
              <header className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
                    Saída
                  </div>
                  <div className="mt-1 text-balance text-[17px] font-extrabold capitalize tracking-[-0.4px] text-ink">
                    {formatFullDate(trip.departureTime)}
                  </div>
                </div>
                <StatusPill status={trip.tripStatus} />
              </header>

              <RouteVisualTimeline
                origin={{
                  name: trip.departurePoint ?? "—",
                  address: trip.template?.origin,
                  time: formatDateTime(trip.departureTime, true),
                }}
                destination={{
                  name: trip.destination ?? "—",
                  address: trip.template?.destination,
                  time: trip.arrivalEstimate
                    ? formatDateTime(trip.arrivalEstimate, true)
                    : undefined,
                  estimatedArrival: !!trip.arrivalEstimate,
                }}
                className="mt-3.5"
              />

              {tripDates.length > 1 && (
                <div className="mt-3.5 border-t border-dashed border-line pt-3">
                  <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
                    Escolha a data
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tripDates.map((d) => {
                      const active = d.id === id;
                      return (
                        <Link
                          key={d.id}
                          to="/public/trip-instances/$id"
                          params={{ id: d.id }}
                          className={
                            active
                              ? "rounded-full border border-ink bg-ink px-3 py-1.5 text-[12px] font-bold text-surface"
                              : "rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink-2 hover:border-ink-2"
                          }
                        >
                          {formatChipDate(d.departureTime)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-3.5 border-t border-dashed border-line pt-3">
                <MetadataRow items={buildMeta(trip, availability?.availableSlots)} />
              </div>

              {driverName && (
                <div className="mt-3 border-t border-dashed border-line pt-3 text-[12px] text-muted-foreground">
                  Motorista: <span className="font-semibold text-ink-2">{driverName}</span>
                </div>
              )}
            </article>

            {trip.organizationName && (
              <Link
                to={
                  trip.organizationSlug ? "/public/organizations/$slug" : "/public/trip-instances"
                }
                params={trip.organizationSlug ? { slug: trip.organizationSlug } : undefined}
                className="mb-3 flex items-center gap-3 rounded-[14px] border border-line bg-surface p-3.5 transition hover:border-ink-2"
              >
                <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl border border-line bg-surface-2">
                  <Building2 className="h-5 w-5 text-ink" strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-extrabold tracking-[-0.2px] text-ink">
                    {trip.organizationName}
                  </span>
                  <span className="mt-px block text-[11px] text-muted-foreground">
                    Ver perfil da empresa
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-ink-2" strokeWidth={1.6} />
              </Link>
            )}

            {trip.stops && trip.stops.length > 0 && (
              <div className="mb-3 rounded-[14px] border border-line bg-surface p-3.5">
                <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
                  Paradas
                </h3>
                <ol className="flex flex-col gap-2">
                  {trip.stops.map((stop, i) => (
                    <li
                      key={`${stop}-${i}`}
                      className="flex items-start gap-2.5 text-[13px] text-ink"
                    >
                      <span className="mt-px inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent-soft font-mono text-[10px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <span>{stop}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 p-3 text-[11px] leading-[1.45] text-ink-2">
              <AlertCircle className="mt-px h-4 w-4 flex-none text-ink-2" strokeWidth={1.6} />
              <span>
                Apresente-se 15 min antes da saída. Cancelamento gratuito até 2h antes — depois
                disso, sem reembolso.
              </span>
            </div>
          </div>

          <StickyCta
            trip={trip}
            availableSlots={availability?.availableSlots}
            existingBookingId={existingBooking?.id}
            isAuthenticated={isAuthenticated}
            id={id}
          />
        </>
      )}
    </AppShell>
  );
}

function buildMeta(
  trip: {
    departureTime: string;
    arrivalEstimate?: string;
    availableSlots?: number;
    totalCapacity: number;
    priceOneWay?: number;
  },
  realSlots?: number,
): MetadataItem[] {
  const items: MetadataItem[] = [];
  const dur = durationLabel(trip.departureTime, trip.arrivalEstimate);
  if (dur) {
    items.push({
      label: "Duração",
      value: dur,
      icon: <Clock className="h-3 w-3" strokeWidth={1.6} />,
    });
  }
  // `availableSlots` só existe via endpoint autenticado de disponibilidade. Sem ele
  // (visitante deslogado), mostramos a capacidade neutra em vez de vagas falsas.
  const seats = realSlots ?? trip.availableSlots;
  items.push(
    seats != null
      ? {
          label: "Vagas",
          value: seats <= 0 ? "Lotada" : `${seats} livres`,
          icon: <Users className="h-3 w-3" strokeWidth={1.6} />,
        }
      : {
          label: "Capacidade",
          value: `Até ${trip.totalCapacity} lugares`,
          icon: <Users className="h-3 w-3" strokeWidth={1.6} />,
        },
  );
  if (trip.priceOneWay != null) {
    items.push({
      label: "Preço",
      value: `R$ ${trip.priceOneWay.toFixed(0)}`,
      icon: <DollarSign className="h-3 w-3" strokeWidth={1.6} />,
      strong: true,
    });
  }
  return items;
}

function StickyCta({
  trip,
  availableSlots,
  existingBookingId,
  isAuthenticated,
  id,
}: {
  trip: {
    organizationId?: string;
    priceOneWay?: number;
    totalCapacity: number;
    availableSlots?: number;
  };
  availableSlots?: number;
  existingBookingId?: string;
  isAuthenticated: boolean;
  id: string;
}) {
  // Só consideramos "lotada" quando há disponibilidade real (logado). Sem ela, não bloqueamos o CTA.
  const seats = availableSlots ?? trip.availableSlots;
  const lotada = seats != null && seats <= 0;
  const price = trip.priceOneWay;

  return (
    <div className="fixed inset-x-0 bottom-[64px] z-10 border-t border-line bg-surface pb-[max(env(safe-area-inset-bottom),0px)]">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        {price != null && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
              Total
            </div>
            <div className="font-mono text-[20px] font-extrabold leading-none tracking-[-0.5px] text-ink">
              R$ {price.toFixed(0)}
            </div>
          </div>
        )}
        <CtaButton
          trip={trip}
          existingBookingId={existingBookingId}
          isAuthenticated={isAuthenticated}
          id={id}
          lotada={lotada}
        />
      </div>
    </div>
  );
}

function CtaButton({
  trip,
  existingBookingId,
  isAuthenticated,
  id,
  lotada,
}: {
  trip: { organizationId?: string };
  existingBookingId?: string;
  isAuthenticated: boolean;
  id: string;
  lotada: boolean;
}) {
  const base =
    "flex flex-1 items-center justify-center gap-2 rounded-[12px] px-4 py-3.5 text-[14px] font-bold transition-colors";
  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        search={{ redirect: `/public/trip-instances/${id}` }}
        className={`${base} ${lotada ? "pointer-events-none bg-surface-2 text-muted-foreground" : "bg-ink text-surface hover:bg-ink/90"}`}
      >
        {lotada ? "Viagem lotada" : "Entrar para reservar"}
        {!lotada && <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />}
      </Link>
    );
  }
  if (existingBookingId) {
    return (
      <Link
        to="/my-bookings/$bookingId"
        params={{ bookingId: existingBookingId }}
        className={`${base} border border-line bg-surface text-ink hover:bg-line-soft`}
      >
        Você já está inscrito — ver inscrição
      </Link>
    );
  }
  if (trip.organizationId) {
    return (
      <Link
        to="/trips/$orgId/$tripId/book"
        params={{ orgId: trip.organizationId, tripId: id }}
        className={`${base} ${lotada ? "pointer-events-none bg-surface-2 text-muted-foreground" : "bg-ink text-surface hover:bg-ink/90"}`}
      >
        {lotada ? "Viagem lotada" : "Inscrever-se"}
        {!lotada && <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />}
      </Link>
    );
  }
  return null;
}
