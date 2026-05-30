import { useState } from "react";
import { toast } from "sonner";
import { BottomSheet, BottomSheetContent } from "@/components/visual/BottomSheet";
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
    <BottomSheet open={!!driver} onOpenChange={(o) => !o && onClose()}>
      <BottomSheetContent title="Editar dados do motorista">
        {driver && (
          <DriverProfileForm
            mode="edit"
            initialData={driver}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
