import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TripCard } from "@/components/domain/TripCard";
import type { TripInstance } from "@/lib/types";

export const Route = createFileRoute("/_protected/trips/$orgId")({
  validateSearch: z.object({ slug: z.string().optional() }),
  component: TripsPage,
});

function TripsPage() {
  const { orgId } = Route.useParams();
  const { slug } = Route.useSearch();
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = slug
      ? tripsService.listBySlug(slug)
      : tripsService.listByOrgId(orgId);

    fetch
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        const sorted = [...list].sort(
          (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
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
  }, [orgId, slug]);

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
        <Card className="p-6 text-center text-muted-foreground">Nenhuma viagem disponível.</Card>
      ) : (
        <ul className="space-y-3">
          {trips!.map((trip) => (
            <li key={trip.id}>
              <Link
                to="/_protected/trips/$orgId/$tripId"
                params={{ orgId, tripId: trip.id }}
                className="block"
              >
                <TripCard trip={trip} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
