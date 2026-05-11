import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { tripsService } from "@/services/trips.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Driver, TripTemplate, Vehicle } from "@/lib/types";

const tripSchema = z
  .object({
    tripTemplateId: z.string().min(1, "Selecione um template"),
    departureDate: z.string().min(1, "Informe a data de partida"),
    departureTime: z.string().min(1, "Informe a hora de partida"),
    arrivalDate: z.string().min(1, "Informe a data de chegada"),
    arrivalTime: z.string().min(1, "Informe a hora estimada de chegada"),
    totalCapacity: z.coerce.number().int().min(1, "Capacidade deve ser ao menos 1"),
    initialStatus: z.enum(["DRAFT", "SCHEDULED"]),
    driverId: z.string().optional(),
    vehicleId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.initialStatus === "SCHEDULED") {
      if (!data.driverId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["driverId"],
          message: "Motorista é obrigatório para status Agendada",
        });
      }
      if (!data.vehicleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["vehicleId"],
          message: "Veículo é obrigatório para status Agendada",
        });
      }
    }
  });

type FormState = {
  tripTemplateId: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  totalCapacity: string;
  initialStatus: "DRAFT" | "SCHEDULED";
  driverId: string;
  vehicleId: string;
};

const EMPTY: FormState = {
  tripTemplateId: "",
  departureDate: "",
  departureTime: "",
  arrivalDate: "",
  arrivalTime: "",
  totalCapacity: "",
  initialStatus: "DRAFT",
  driverId: "",
  vehicleId: "",
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  orgId: string | null | undefined;
  templates: TripTemplate[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onCreated: () => void;
};

export function TripFormSheet({
  open,
  onOpenChange,
  orgId,
  templates,
  drivers,
  vehicles,
  onCreated,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setFieldErrors({});
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    const parsed = tripSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errs[e.path.join(".")] = e.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const {
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
        driverId,
        vehicleId,
        ...rest
      } = parsed.data;
      await tripsService.create(orgId, {
        ...rest,
        driverId: driverId || undefined,
        vehicleId: vehicleId || undefined,
        departureTime: new Date(`${departureDate}T${departureTime}`).toISOString(),
        arrivalEstimate: new Date(`${arrivalDate}T${arrivalTime}`).toISOString(),
      });
      toast.success("Viagem criada");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      handleApiError(err, "Erro ao criar viagem");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90dvh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Nova viagem</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-8">
          <div className="space-y-1">
            <Label>Template de rota</Label>
            <Select
              value={form.tripTemplateId}
              onValueChange={(v) => setForm((f) => ({ ...f, tripTemplateId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    {tpl.departurePoint} → {tpl.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.tripTemplateId && (
              <p className="text-xs text-destructive">{fieldErrors.tripTemplateId}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Data de partida</Label>
            <Input
              type="date"
              value={form.departureDate}
              onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))}
            />
            {fieldErrors.departureDate && (
              <p className="text-xs text-destructive">{fieldErrors.departureDate}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Hora de partida</Label>
            <Input
              type="time"
              value={form.departureTime}
              onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))}
            />
            {fieldErrors.departureTime && (
              <p className="text-xs text-destructive">{fieldErrors.departureTime}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Data estimada de chegada</Label>
            <Input
              type="date"
              value={form.arrivalDate}
              onChange={(e) => setForm((f) => ({ ...f, arrivalDate: e.target.value }))}
            />
            {fieldErrors.arrivalDate && (
              <p className="text-xs text-destructive">{fieldErrors.arrivalDate}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Hora estimada de chegada</Label>
            <Input
              type="time"
              value={form.arrivalTime}
              onChange={(e) => setForm((f) => ({ ...f, arrivalTime: e.target.value }))}
            />
            {fieldErrors.arrivalTime && (
              <p className="text-xs text-destructive">{fieldErrors.arrivalTime}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Capacidade total</Label>
            <Input
              type="number"
              min="1"
              value={form.totalCapacity}
              onChange={(e) => setForm((f) => ({ ...f, totalCapacity: e.target.value }))}
              placeholder="Ex: 40"
            />
            {fieldErrors.totalCapacity && (
              <p className="text-xs text-destructive">{fieldErrors.totalCapacity}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Status inicial</Label>
            <Select
              value={form.initialStatus}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, initialStatus: v as "DRAFT" | "SCHEDULED" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="SCHEDULED">Agendada (requer motorista e veículo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>
              Motorista
              {form.initialStatus === "SCHEDULED" && (
                <span className="text-destructive ml-0.5">*</span>
              )}
            </Label>
            <Select
              value={form.driverId || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, driverId: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem motorista</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.userName ? `${d.userName} — CNH ${d.cnh}` : `CNH ${d.cnh}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.driverId && (
              <p className="text-xs text-destructive">{fieldErrors.driverId}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>
              Veículo
              {form.initialStatus === "SCHEDULED" && (
                <span className="text-destructive ml-0.5">*</span>
              )}
            </Label>
            <Select
              value={form.vehicleId || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem veículo</SelectItem>
                {vehicles
                  .filter((v) => v.status !== "INACTIVE")
                  .map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.model} — {v.plate}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {fieldErrors.vehicleId && (
              <p className="text-xs text-destructive">{fieldErrors.vehicleId}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Criando..." : "Criar viagem"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}