import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useVehicles } from "@/features/vehicles/hooks/useVehicles";
import { VehiclesList } from "@/features/vehicles/components/VehiclesList";
import { VehicleFormDialog } from "@/features/vehicles/components/VehicleFormDialog";
import { RemoveVehicleDialog } from "@/features/vehicles/components/RemoveVehicleDialog";
import type { Vehicle } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/vehicles")({
  component: VehiclesPage,
});

function VehiclesPage() {
  const { adminOrgId } = useRole();
  const { vehicles, setVehicles, loading, error } = useVehicles(adminOrgId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [removing, setRemoving] = useState<Vehicle | null>(null);

  const active = (vehicles ?? []).filter((v) => v.status !== "INACTIVE");
  const hasVehicles = active.length > 0;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditing(v);
    setFormOpen(true);
  }

  return (
    <AppShell title="Veículos" back>
      {hasVehicles && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingList count={3} height="h-20" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <VehiclesList
          vehicles={vehicles ?? []}
          onAdd={openCreate}
          onEdit={openEdit}
          onRemove={setRemoving}
        />
      )}

      <VehicleFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        orgId={adminOrgId}
        editing={editing}
        onCreated={(v) => setVehicles((prev) => [v, ...(prev ?? [])])}
        onUpdated={(v) => setVehicles((prev) => prev?.map((x) => (x.id === v.id ? v : x)) ?? null)}
      />

      <RemoveVehicleDialog
        vehicle={removing}
        onClose={() => setRemoving(null)}
        onRemoved={(v) => setVehicles((prev) => prev?.filter((x) => x.id !== v.id) ?? null)}
      />
    </AppShell>
  );
}
