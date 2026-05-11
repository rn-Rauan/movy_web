import { useState } from "react";
import { handleApiError } from "@/lib/handle-error";
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
import type { TripTemplate } from "@/lib/types";

type Props = {
  template: TripTemplate | null;
  onClose: () => void;
  onDeleted: (tpl: TripTemplate) => void;
};

export function DeleteTemplateDialog({ template, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!template) return;
    setDeleting(true);
    try {
      await templatesService.remove(template.id);
      onDeleted(template);
      toast.success("Template removido");
    } catch (err) {
      handleApiError(err, "Erro ao remover template");
    } finally {
      setDeleting(false);
      onClose();
    }
  }

  return (
    <AlertDialog open={!!template} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover template?</AlertDialogTitle>
          <AlertDialogDescription>
            {template?.departurePoint} → {template?.destination} será desativado. Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
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