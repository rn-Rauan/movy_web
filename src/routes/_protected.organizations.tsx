import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { OrgsList } from "@/features/organizations/components/OrgsList";

export const Route = createFileRoute("/_protected/organizations")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { orgs, filtered, search, setSearch, resetFilters, hasActiveFilters, loading, error } =
    useOrganizations();

  const hasOrgs = (orgs?.length ?? 0) > 0;

  return (
    <AppShell title="Empresas">
      <p className="text-sm text-muted-foreground mb-4">
        Escolha a empresa para ver as viagens disponíveis.
      </p>

      {hasOrgs && (
        <div className="relative mb-4">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa pelo nome"
            className="pl-9 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <LoadingList count={3} height="h-20" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : hasActiveFilters && filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          <p className="mb-3">Nenhuma empresa encontrada.</p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Limpar busca
          </Button>
        </div>
      ) : (
        <OrgsList orgs={filtered} />
      )}
    </AppShell>
  );
}
