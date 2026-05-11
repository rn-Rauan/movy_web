import { useState } from "react";
import { toast } from "sonner";
import { driversService } from "@/services/drivers.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DRIVER_ROLE_ID } from "../hooks/useDrivers";
import type { Driver } from "@/lib/types";

type Props = {
  driver: Driver | null;
  orgId: string | null | undefined;
  onClose: () => void;
  onRemoved: (driver: Driver) => void;
  onRefetch: () => void;
};

export function RemoveDriverDialog({ driver, orgId, onClose, onRemoved, onRefetch }: Props) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!driver || !orgId) return;
    const removed = driver;
    setRemoving(true);
    try {
      await driversService.removeMembership(removed.userId, DRIVER_ROLE_ID, orgId);
      onRemoved(removed);
      toast.success("Motorista removido", {
        action: {
          label: "Desfazer",
          onClick: async () => {
            try {
              await driversService.restoreMembership(removed.userId, DRIVER_ROLE_ID, orgId);
              toast.success("Motorista restaurado");
              onRefetch();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Erro ao restaurar motorista");
            }
          },
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover motorista");
    } finally {
      setRemoving(false);
      onClose();
    }
  }

  return (
    <AlertDialog open={!!driver} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover motorista?</AlertDialogTitle>
          <AlertDialogDescription>
            {driver?.userName ?? driver?.userEmail ?? "Este motorista"} será desvinculado da
            organização.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={removing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {removing ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
