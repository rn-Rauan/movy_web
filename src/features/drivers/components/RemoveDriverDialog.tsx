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
import { FormApiError } from "@/components/feedback/FormError";
import { apiErrorMessage } from "@/lib/handle-error";
import { DRIVER_ROLE_ID } from "../hooks/useDrivers";
import { useDriverName } from "../hooks/useDriverName";
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
  const [submitError, setSubmitError] = useState<unknown>(null);
  const inlineName = driver?.userName ?? driver?.userEmail;
  const { name: fetchedName } = useDriverName(driver && !inlineName ? driver.id : null);
  const displayName = inlineName ?? fetchedName ?? "Este motorista";

  function handleClose() {
    setSubmitError(null);
    onClose();
  }

  async function handleRemove() {
    if (!driver || !orgId) return;
    const removed = driver;
    setSubmitError(null);
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
              toast.error(apiErrorMessage(err, "Erro ao restaurar motorista"));
            }
          },
        },
      });
      handleClose();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <AlertDialog open={!!driver} onOpenChange={(o) => !o && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover motorista?</AlertDialogTitle>
          <AlertDialogDescription>
            {displayName} será desvinculado da organização.
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
