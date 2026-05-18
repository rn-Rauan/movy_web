import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleApiError } from "@/lib/handle-error";
import { templatesService } from "@/services/templates.service";
import type { TripTemplate } from "@/lib/types";

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

  const placeholder = String(defaultDaysAhead ?? 14);

  useEffect(() => {
    if (template) {
      setDaysAhead("");
      setError(null);
    }
  }, [template]);

  async function handleGenerate() {
    if (!template) return;
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
      handleApiError(err, "Erro ao gerar viagens");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={template !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar viagens agora</DialogTitle>
          <DialogDescription>
            Cria as próximas viagens deste template recorrente. Dias passados, fora da frequência ou
            já existentes são ignorados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label>Dias à frente (1–90)</Label>
          <Input
            type="number"
            min="1"
            max="90"
            step="1"
            value={daysAhead}
            onChange={(e) => setDaysAhead(e.target.value)}
            placeholder={placeholder}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Em branco usa o padrão da organização ({placeholder} dias).
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={submitting}>
            {submitting ? "Gerando..." : "Gerar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
