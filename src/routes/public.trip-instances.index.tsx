import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { usePublicTrips } from "@/features/trips/hooks/usePublicTrips";
import { PublicTripCard } from "@/features/trips/components/PublicTripCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
  const { filtered, search, setSearch, loading, error } = usePublicTrips();

  return (
    <AppShell title="Viagens">
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

      {loading ? (
        <LoadingList count={3} height="h-40" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            {filtered.length} viagens encontradas
          </p>
          <ul className="space-y-3">
            {filtered.map((trip) => (
              <li key={trip.id}>
                <PublicTripCard trip={trip} />
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
