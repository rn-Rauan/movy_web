import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useDrivers } from "@/features/drivers/hooks/useDrivers";
import { DriversList } from "@/features/drivers/components/DriversList";
import { AddDriverDialog } from "@/features/drivers/components/AddDriverDialog";
import { RemoveDriverDialog } from "@/features/drivers/components/RemoveDriverDialog";
import type { Driver } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/drivers")({
  component: DriversPage,
});

function DriversPage() {
  const { adminOrgId, refetchRole } = useRole();
  const { drivers, setDrivers, loading, error, refetch } = useDrivers(adminOrgId);
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<Driver | null>(null);

  return (
    <AppShell
      title="Motoristas"
      back
      action={
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Adicionar
        </button>
      }
    >
      {loading ? (
        <LoadingList count={3} height="h-20" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <DriversList
          drivers={drivers ?? []}
          onAdd={() => setAddOpen(true)}
          onRemove={setRemoving}
        />
      )}

      <AddDriverDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => {
          refetch();
          refetchRole();
        }}
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
