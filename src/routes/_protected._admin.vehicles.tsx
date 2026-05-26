import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
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

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditing(v);
    setFormOpen(true);
  }

  return (
    <AppShell
      title="Veículos"
      back
      action={
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Novo
        </button>
      }
    >
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
