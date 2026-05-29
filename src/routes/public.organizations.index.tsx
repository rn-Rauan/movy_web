import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { CompanyCard } from "@/features/organizations/components/CompanyCard";
import { usePublicOrganizations } from "@/features/organizations/hooks/usePublicOrganizations";

export const Route = createFileRoute("/public/organizations/")({
  head: () => ({
    meta: [
      { title: "Empresas de transporte" },
      { name: "description", content: "Conheça as empresas que oferecem viagens na plataforma." },
    ],
  }),
  component: PublicOrgsListPage,
});

function PublicOrgsListPage() {
  const { filtered, orgs, search, setSearch, loading, error } = usePublicOrganizations();
  const total = orgs?.length ?? 0;

  return (
    <AppShell title="Empresas">
      <div className="-mx-4 -mt-3.5 mb-3 border-b border-line bg-background px-4 py-3">
        <p className="mb-2.5 rounded-[10px] border border-line bg-surface-2 px-3 py-2 text-[12px] leading-[1.4] text-ink-2">
          Encontre empresas de transporte e conheça suas viagens.
        </p>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.6}
          />
          <Input
            placeholder="Buscar empresa"
            className="h-10 rounded-[11px] border-line bg-surface pl-9 text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingList count={3} height="h-44" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="search"
          title="Nenhuma empresa encontrada"
          description={
            total === 0
              ? "Ainda não há empresas com viagens públicas."
              : "Tente outro termo de busca."
          }
        />
      ) : (
        <>
          <div className="mb-2.5 px-0.5 text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "empresa" : "empresas"}
          </div>
          <ul className="flex flex-col gap-2">
            {filtered.map((org) => (
              <li key={org.id}>
                <CompanyCard org={org} />
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
