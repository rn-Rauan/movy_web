import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { LoginRequired } from "@/components/feedback/LoginRequired";
import { useAuth } from "@/lib/auth-context";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { OrgsList } from "@/features/organizations/components/OrgsList";

export const Route = createFileRoute("/_protected/organizations")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <AppShell title="Empresas">
        <LoginRequired message="Entre na sua conta para ver as empresas e reservar viagens." />
      </AppShell>
    );
  }
  return <OrganizationsContent />;
}

function OrganizationsContent() {
  const { orgs, filtered, search, setSearch, resetFilters, hasActiveFilters, loading, error } =
    useOrganizations();

  const hasOrgs = (orgs?.length ?? 0) > 0;

  return (
    <AppShell title="Empresas">
      <div className="-mx-4 -mt-3.5 mb-3 border-b border-line bg-background px-4 py-3">
        <p className="mb-2.5 rounded-[10px] border border-line bg-surface-2 px-3 py-2 text-[12px] leading-[1.4] text-ink-2">
          Escolha a empresa para ver as viagens disponíveis.
        </p>
        {hasOrgs && (
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.6}
            />
            <Input
              placeholder="Buscar empresa pelo nome"
              className="h-10 rounded-[11px] border-line bg-surface pl-9 text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingList count={3} height="h-44" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : hasActiveFilters && filtered.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-surface p-6 text-center text-[13px] text-muted-foreground">
          <p className="mb-3">Nenhuma empresa encontrada.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="rounded-full border-line"
          >
            Limpar busca
          </Button>
        </div>
      ) : (
        <OrgsList orgs={filtered} />
      )}
    </AppShell>
  );
}
