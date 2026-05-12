import { useState } from "react";
import { toast } from "sonner";
import { vehiclesService } from "@/services/vehicles.service";
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
import type { Vehicle } from "@/lib/types";

type Props = {
  vehicle: Vehicle | null;
  onClose: () => void;
  onRemoved: (v: Vehicle) => void;
};

export function RemoveVehicleDialog({ vehicle, onClose, onRemoved }: Props) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!vehicle) return;
    setRemoving(true);
    try {
      await vehiclesService.deactivate(vehicle.id);
      onRemoved(vehicle);
      toast.success("Veículo removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover veículo");
    } finally {
      setRemoving(false);
      onClose();
    }
  }

  return (
    <AlertDialog open={!!vehicle} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover veículo?</AlertDialogTitle>
          <AlertDialogDescription>
            {vehicle?.model} ({vehicle?.plate}) será desativado.
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
