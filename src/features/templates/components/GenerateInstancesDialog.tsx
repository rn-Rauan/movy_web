import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet, BottomSheetContent } from "@/components/visual/BottomSheet";
import { FormApiError } from "@/components/feedback/FormError";
import { templatesService } from "@/services/templates.service";
import { cn } from "@/lib/utils";
import type { TripTemplate } from "@/lib/types";

const FIELD_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-muted-foreground";

type Props = {
  template: TripTemplate | null;
  /** Default daysAhead from org scheduling config (used as placeholder). */
  defaultDaysAhead?: number | null;
  onClose: () => void;
};

export function GenerateInstancesDialog({ template, defaultDaysAhead, onClose }: Props) {
  const [daysAhead, setDaysAhead] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const placeholder = String(defaultDaysAhead ?? 14);

  useEffect(() => {
    if (template) {
      setDaysAhead("");
      setError(null);
      setSubmitError(null);
    }
  }, [template]);

  async function handleGenerate() {
    if (!template) return;
    setSubmitError(null);
    let daysAheadValue: number | undefined;
    if (daysAhead.trim()) {
      const n = Number(daysAhead);
      if (!Number.isInteger(n) || n < 1 || n > 90) {
        setError("Informe um número inteiro entre 1 e 90");
        return;
      }
      daysAheadValue = n;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await templatesService.generateInstances(template.id, daysAheadValue);
      toast.success(
        `${result.created} criadas · ${result.skipped} ignoradas · ${result.failed} falhas`,
      );
      onClose();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={template !== null} onOpenChange={(o) => !o && onClose()}>
      <BottomSheetContent
        title="Gerar viagens agora"
        footer={
          <button
            type="button"
            onClick={handleGenerate}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <CalendarPlus className="h-[15px] w-[15px]" strokeWidth={2.2} />
            {submitting ? "Gerando..." : "Gerar viagens"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <FormApiError error={submitError} />
          <p className="text-[12px] leading-[1.5] text-muted-foreground">
            Cria as próximas viagens deste template recorrente. Dias passados, fora da frequência ou
            já existentes são ignorados.
          </p>

          <div>
            <Label className="mb-1.5 block text-[12px] font-bold tracking-[-0.1px] text-ink">
              Dias à frente (1–90)
            </Label>
            <Input
              type="number"
              min="1"
              max="90"
              step="1"
              value={daysAhead}
              onChange={(e) => setDaysAhead(e.target.value)}
              placeholder={placeholder}
              className={cn(FIELD_CLS, "font-mono")}
            />
            {error && <p className="mt-1 text-[11px] font-medium text-danger">{error}</p>}
            <p className="mt-1.5 text-[11px] leading-[1.4] text-muted-foreground">
              Em branco usa o padrão da organização ({placeholder} dias).
            </p>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
