import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useDrivers } from "@/features/drivers/hooks/useDrivers";
import { DriversList } from "@/features/drivers/components/DriversList";
import { AddDriverDialog } from "@/features/drivers/components/AddDriverDialog";
import { EditDriverDialog } from "@/features/drivers/components/EditDriverDialog";
import { RemoveDriverDialog } from "@/features/drivers/components/RemoveDriverDialog";
import type { Driver } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/drivers")({
  component: DriversPage,
});

function DriversPage() {
  const { adminOrgId } = useRole();
  const { drivers, setDrivers, loading, error, refetch } = useDrivers(adminOrgId);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [removing, setRemoving] = useState<Driver | null>(null);

  const hasDrivers = (drivers?.length ?? 0) > 0;

  return (
    <AppShell title="Motoristas" back>
      {hasDrivers && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingList count={3} height="h-20" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <DriversList
          drivers={drivers ?? []}
          onAdd={() => setAddOpen(true)}
          onEdit={setEditing}
          onRemove={setRemoving}
        />
      )}

      <AddDriverDialog open={addOpen} onOpenChange={setAddOpen} onAdded={refetch} />
      <EditDriverDialog
        driver={editing}
        onClose={() => setEditing(null)}
        onUpdated={(updated) =>
          setDrivers((prev) => prev?.map((d) => (d.id === updated.id ? updated : d)) ?? null)
        }
      />
      <RemoveDriverDialog
        driver={removing}
        orgId={adminOrgId}
        onClose={() => setRemoving(null)}
        onRemoved={(removed) =>
          setDrivers((prev) => prev?.filter((d) => d.id !== removed.id) ?? null)
        }
        onRefetch={refetch}
      />
    </AppShell>
  );
}
