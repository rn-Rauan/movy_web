import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { LoginRequired } from "@/components/feedback/LoginRequired";
import { useAuth } from "@/lib/auth-context";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { TripsList } from "@/features/trips/components/TripsList";

export const Route = createFileRoute("/_protected/trips/$orgId")({
  validateSearch: z.object({ slug: z.string().optional() }),
  component: TripsRoute,
});

function TripsRoute() {
  const { orgId } = Route.useParams();
  const location = useLocation();
  // When navigating to a child route (e.g. /trips/$orgId/$tripId), render only the Outlet
  // so the parent's admin-only fetch (`useTrips`) doesn't run.
  if (location.pathname !== `/trips/${orgId}`) {
    return <Outlet />;
  }
  return <TripsListPage />;
}

function TripsListPage() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <AppShell title="Viagens" back>
        <LoginRequired message="Entre na sua conta para ver as viagens desta empresa." />
      </AppShell>
    );
  }
  return <TripsListContent />;
}

function TripsListContent() {
  const { orgId } = Route.useParams();
  const { slug } = Route.useSearch();
  const { trips, loading, error } = useTrips({ orgId, slug });

  return (
    <AppShell title="Viagens" back>
      {loading ? (
        <LoadingList count={3} height="h-28" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <TripsList trips={trips ?? []} />
      )}
    </AppShell>
  );
}
