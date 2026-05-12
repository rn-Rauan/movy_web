import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { vehiclesService } from "@/services/vehicles.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = vehicleSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((er) => {
        errs[er.path.join(".")] = er.message;
      });
      setFieldErrors(errs);
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
      handleApiError(err, "Erro ao salvar veículo");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar veículo" : "Novo veículo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label>Placa</Label>
            <Input
              value={form.plate}
              maxLength={7}
              placeholder="ABC1D23"
              onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))}
            />
            {fieldErrors.plate && <p className="text-xs text-destructive">{fieldErrors.plate}</p>}
          </div>
          <div className="space-y-1">
            <Label>Modelo</Label>
            <Input
              value={form.model}
              placeholder="Ex: Mercedes-Benz Sprinter"
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            />
            {fieldErrors.model && <p className="text-xs text-destructive">{fieldErrors.model}</p>}
          </div>
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as FormState["type"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VAN">Van</SelectItem>
                <SelectItem value="BUS">Ônibus</SelectItem>
                <SelectItem value="MINIBUS">Micro-ônibus</SelectItem>
                <SelectItem value="CAR">Carro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Capacidade máxima</Label>
            <Input
              type="number"
              min="1"
              max="200"
              value={form.maxCapacity}
              placeholder="Ex: 15"
              onChange={(e) => setForm((f) => ({ ...f, maxCapacity: e.target.value }))}
            />
            {fieldErrors.maxCapacity && (
              <p className="text-xs text-destructive">{fieldErrors.maxCapacity}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar veículo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
