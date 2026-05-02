import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/_protected/_admin/drivers")({
  component: DriversPage,
});

function DriversPage() {
  const { adminOrgId } = useRole();

  return (
    <AppShell title="Motoristas" back>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gestão de motoristas da organização.
        </p>
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-medium">Em construção</p>
          <p className="text-xs text-muted-foreground mt-1">
            Org: <span className="font-mono">{adminOrgId}</span>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
