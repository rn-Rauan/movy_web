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
import { FormApiError } from "@/components/feedback/FormError";
import type { Vehicle } from "@/lib/types";

type Props = {
  vehicle: Vehicle | null;
  onClose: () => void;
  onRemoved: (v: Vehicle) => void;
};

export function RemoveVehicleDialog({ vehicle, onClose, onRemoved }: Props) {
  const [removing, setRemoving] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  function handleClose() {
    setSubmitError(null);
    onClose();
  }

  async function handleRemove() {
    if (!vehicle) return;
    setSubmitError(null);
    setRemoving(true);
    try {
      await vehiclesService.deactivate(vehicle.id);
      onRemoved(vehicle);
      toast.success("Veículo removido");
      handleClose();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <AlertDialog open={!!vehicle} onOpenChange={(o) => !o && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover veículo?</AlertDialogTitle>
          <AlertDialogDescription>
            {vehicle?.model} ({vehicle?.plate}) será desativado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormApiError error={submitError} />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }}
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
