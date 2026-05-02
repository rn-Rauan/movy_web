import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { OrgsList } from "@/features/organizations/components/OrgsList";

export const Route = createFileRoute("/_protected/organizations")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { orgs, loading, error } = useOrganizations();

  return (
    <AppShell title="Empresas">
      <p className="text-sm text-muted-foreground mb-4">
        Escolha a empresa para ver as viagens disponíveis.
      </p>
      {loading ? (
        <LoadingList count={3} height="h-20" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <OrgsList orgs={orgs ?? []} />
      )}
    </AppShell>
  );
}
