import { useEffect, useState } from "react";
import { Bus, Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { zodFieldErrors } from "@/lib/handle-error";
import { FormApiError } from "@/components/feedback/FormError";
import { vehiclesService } from "@/services/vehicles.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomSheet, BottomSheetContent } from "@/components/visual/BottomSheet";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

const vehicleSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(7, "Placa deve ter 7 caracteres")
    .max(7, "Placa deve ter 7 caracteres"),
  model: z.string().trim().min(2, "Informe o modelo"),
  type: z.enum(["VAN", "BUS", "MINIBUS", "CAR"]),
  maxCapacity: z.coerce.number().int().min(1).max(200, "Máximo 200"),
});

type FormState = {
  plate: string;
  model: string;
  type: "VAN" | "BUS" | "MINIBUS" | "CAR";
  maxCapacity: string;
};

const EMPTY: FormState = { plate: "", model: "", type: "VAN", maxCapacity: "" };

// Estilo dos campos conforme o padrão dos modais (TripFormSheet): border line, radius 10, ~44px.
const FIELD_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-muted-foreground";
const SELECT_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold data-[placeholder]:font-medium data-[placeholder]:text-muted-foreground";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  orgId: string | null | undefined;
  editing: Vehicle | null;
  onCreated: (v: Vehicle) => void;
  onUpdated: (v: Vehicle) => void;
};

export function VehicleFormDialog({
  open,
  onOpenChange,
  orgId,
  editing,
  onCreated,
  onUpdated,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            plate: editing.plate,
            model: editing.model,
            type: editing.type,
            maxCapacity: String(editing.maxCapacity),
          }
        : EMPTY,
    );
    setFieldErrors({});
    setSubmitError(null);
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const parsed = vehicleSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await vehiclesService.update(editing.id, parsed.data);
        onUpdated(updated);
        toast.success("Veículo atualizado");
      } else {
        if (!orgId) return;
        const created = await vehiclesService.create(orgId, parsed.data);
        onCreated(created);
        toast.success("Veículo adicionado");
      }
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        title={editing ? "Editar veículo" : "Novo veículo"}
        footer={
          <button
            type="submit"
            form="vehicle-form"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {!editing && <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />}
            {submitting ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar veículo"}
          </button>
        }
      >
        <form id="vehicle-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormApiError error={submitError} />
          {/* Modelo */}
          <FormField label="Modelo" error={fieldErrors.model}>
            <Input
              value={form.model}
              placeholder="Mercedes-Benz Sprinter"
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              className={FIELD_CLS}
            />
          </FormField>

          {/* Placa + capacidade */}
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Placa" error={fieldErrors.plate}>
              <Input
                value={form.plate}
                maxLength={7}
                placeholder="ABC1D23"
                onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))}
                className={cn(FIELD_CLS, "font-mono uppercase")}
              />
            </FormField>
            <FormField label="Capacidade" error={fieldErrors.maxCapacity}>
              <div className="flex h-11 items-center rounded-[10px] border border-line bg-surface px-3 focus-within:ring-1 focus-within:ring-ring">
                <input
                  type="number"
                  min="1"
                  max="200"
                  inputMode="numeric"
                  value={form.maxCapacity}
                  onChange={(e) => setForm((f) => ({ ...f, maxCapacity: e.target.value }))}
                  placeholder="15"
                  className="min-w-0 flex-1 bg-transparent font-mono text-[13px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted-foreground"
                />
                <span className="ml-1.5 flex-none text-[13px] text-muted-foreground">assentos</span>
              </div>
            </FormField>
          </div>

          {/* Tipo */}
          <FormField label="Tipo">
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as FormState["type"] }))}
            >
              <SelectTrigger className={SELECT_CLS}>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Bus className="h-3.5 w-3.5 flex-none text-muted-foreground" strokeWidth={1.8} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VAN">Van</SelectItem>
                <SelectItem value="BUS">Ônibus</SelectItem>
                <SelectItem value="MINIBUS">Micro-ônibus</SelectItem>
                <SelectItem value="CAR">Carro</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </form>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1.5">
        <Label className="text-[12px] font-bold tracking-[-0.1px] text-ink">{label}</Label>
        {hint && <span className="ml-auto text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-[11px] font-medium text-danger">{error}</p>}
    </div>
  );
}
