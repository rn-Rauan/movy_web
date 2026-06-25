import { useState } from "react";
import { templatesService } from "@/services/templates.service";
import { toast } from "sonner";
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
import type { TripTemplate } from "@/lib/types";

type Props = {
  template: TripTemplate | null;
  onClose: () => void;
  onDeleted: (tpl: TripTemplate) => void;
};

export function DeleteTemplateDialog({ template, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  function handleClose() {
    setSubmitError(null);
    onClose();
  }

  async function handleDelete() {
    if (!template) return;
    setSubmitError(null);
    setDeleting(true);
    try {
      await templatesService.remove(template.id);
      onDeleted(template);
      toast.success("Template removido");
      handleClose();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={!!template} onOpenChange={(o) => !o && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover template?</AlertDialogTitle>
          <AlertDialogDescription>
            {template?.departurePoint} → {template?.destination} será desativado. Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormApiError error={submitError} />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Mantém o dialog aberto pra exibir erro inline em caso de falha.
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
