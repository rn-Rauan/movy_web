import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ContextBanner } from "@/components/layout/ContextBanner";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { Card } from "@/components/ui/card";
import { usePublicTrips } from "@/features/trips/hooks/usePublicTrips";
import { PublicTripCard } from "@/features/trips/components/PublicTripCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Compass } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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
  const { isAuthenticated } = useAuth();
  const [shift, setShift] = useState<Shift>("ALL");

  const visible = useMemo(
    () => (shift === "ALL" ? filtered : filtered.filter((t) => shiftOf(t.departureTime) === shift)),
    [filtered, shift],
  );

  return (
    <AppShell title="Viagens">
      <ContextBanner variant="public" />

      {!isAuthenticated ? (
        <div className="mb-4 flex justify-end">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
        </div>
      ) : null}

      <div className="relative mb-4">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar origem ou destino"
          className="pl-9 h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
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
        <LoadingList count={3} height="h-40" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <Compass className="h-6 w-6" />
          Nenhuma viagem encontrada com esses filtros.
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">{visible.length} viagens encontradas</p>
          <ul className="space-y-3">
            {visible.map((trip) => (
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
