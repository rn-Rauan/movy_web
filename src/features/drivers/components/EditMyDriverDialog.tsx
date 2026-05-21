import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { driversService } from "@/services/drivers.service";
import { handleApiError } from "@/lib/handle-error";
import { DriverProfileForm, type DriverFormPayload } from "./DriverProfileForm";
import type { Driver } from "@/lib/types";

type Props = {
  /** Driver carregado pra edição. `null` mantém o dialog fechado. */
  driver: Driver | null;
  onClose: () => void;
  onUpdated: (driver: Driver) => void;
};

export function EditMyDriverDialog({ driver, onClose, onUpdated }: Props) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload: DriverFormPayload) {
    if (!driver) return;
    setSubmitting(true);
    try {
      const updated = await driversService.updateMe({
        cnhCategories: payload.cnhCategories,
        cnhExpiresAt: payload.cnhExpiresAt,
      });
      onUpdated(updated);
      toast.success("Dados atualizados");
      onClose();
    } catch (err) {
      handleApiError(err, "Erro ao atualizar perfil");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!driver} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar dados do motorista</DialogTitle>
        </DialogHeader>
        {driver && (
          <DriverProfileForm
            mode="edit"
            initialData={driver}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
