import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { Input } from "@/components/ui/input";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { organizationsService } from "@/services/organizations.service";
import { DATE_RANGE_OPTIONS, isInDateRange, type DateRange } from "@/lib/date-filters";
import { ShareButton } from "@/components/ShareButton";
import { CompanyCard } from "@/features/organizations/components/CompanyCard";
import { PublicTripCard } from "@/features/trips/components/PublicTripCard";
import { SegmentFilter, type SegmentOption } from "@/components/passenger/SegmentFilter";
import type { Organization } from "@/lib/types";

type Shift = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";
const SHIFT_SEGMENTS: SegmentOption<Shift>[] = [
  { value: "ALL", label: "Todos" },
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
];
const DATE_SEGMENTS: SegmentOption<DateRange>[] = DATE_RANGE_OPTIONS.map((d) => ({
  value: d.value,
  label: d.value === "ANY" ? "Qualquer" : d.value === "THIS_WEEK" ? "Esta sem." : d.label,
}));

function shiftOf(iso: string): Exclude<Shift, "ALL"> {
  const h = new Date(iso).getHours();
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
  const [dateRange, setDateRange] = useState<DateRange>("ANY");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    organizationsService.getBySlug(slug).then(
      (res) => {
        if (!cancelled) setOrg(res);
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const orgName = org?.name || (trips && trips.length > 0 && trips[0].organizationName) || slug;

  const visible = useMemo(() => {
    const list = trips ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((t) => {
      if (shift !== "ALL" && shiftOf(t.departureTime) !== shift) return false;
      if (!isInDateRange(t.departureTime, dateRange)) return false;
      if (q) {
        const matches =
          t.departurePoint?.toLowerCase().includes(q) || t.destination?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [trips, shift, dateRange, search]);

  const hasTrips = (trips?.length ?? 0) > 0;
  const hasActiveFilters = shift !== "ALL" || dateRange !== "ANY" || search.trim() !== "";

  function resetFilters() {
    setShift("ALL");
    setDateRange("ANY");
    setSearch("");
  }

  return (
    <AppShell
      title="Empresa"
      back
      action={
        <ShareButton
          title={typeof orgName === "string" ? orgName : "Empresa"}
          text={`Confira as viagens de ${orgName}`}
          url={`/public/organizations/${slug}`}
          variant="outline"
          size="sm"
        />
      }
    >
      <div className="mb-3">
        <CompanyCard
          org={
            org ?? {
              id: slug,
              slug,
              name: typeof orgName === "string" ? orgName : slug,
            }
          }
          primaryHref={`/public/organizations/${slug}`}
        />
      </div>

      <div className="mb-3 flex items-center justify-between px-0.5">
        <h3 className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">Próximas viagens</h3>
        <Link to="/login" className="text-[12px] font-bold text-accent hover:underline">
          Entrar para reservar
        </Link>
      </div>

      {hasTrips && (
        <div className="mb-3 flex flex-col gap-1.5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.6}
            />
            <Input
              placeholder="Buscar por origem ou destino"
              className="h-10 rounded-[11px] border-line bg-surface pl-9 text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <SegmentFilter options={DATE_SEGMENTS} value={dateRange} onChange={setDateRange} />
          <SegmentFilter options={SHIFT_SEGMENTS} value={shift} onChange={setShift} />
        </div>
      )}

      {loading ? (
        <LoadingList count={2} height="h-36" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : visible.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-surface p-6 text-center text-[13px] text-muted-foreground">
          <p className="mb-3">
            {hasActiveFilters
              ? "Nenhuma viagem disponível com esses filtros."
              : "Nenhuma viagem disponível no momento."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] font-bold text-ink-2 hover:bg-line-soft"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((trip) => (
            <li key={trip.id}>
              <PublicTripCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
