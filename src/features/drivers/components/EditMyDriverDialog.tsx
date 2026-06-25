import { useState } from "react";
import { toast } from "sonner";
import { BottomSheet, BottomSheetContent } from "@/components/visual/BottomSheet";
import { FormApiError } from "@/components/feedback/FormError";
import { driversService } from "@/services/drivers.service";
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
  const [submitError, setSubmitError] = useState<unknown>(null);

  async function handleSubmit(payload: DriverFormPayload) {
    if (!driver) return;
    setSubmitError(null);
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
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet
      open={!!driver}
      onOpenChange={(o) => {
        if (!o) {
          setSubmitError(null);
          onClose();
        }
      }}
    >
      <BottomSheetContent title="Editar dados do motorista">
        {driver && (
          <div className="flex flex-col gap-3">
            <FormApiError error={submitError} />
            <DriverProfileForm
              mode="edit"
              initialData={driver}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
