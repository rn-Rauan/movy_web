import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { utcHourToBr } from "@/lib/timezone";
import { tripsService } from "@/services/trips.service";
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
import { DriverDisplayName } from "@/features/drivers/components/DriverDisplayName";
import { driverDisplayString } from "@/features/drivers/lib/driver-display";
import type { Driver, TripTemplate, Vehicle } from "@/lib/types";

const tripSchema = z
  .object({
    tripTemplateId: z.string().min(1, "Selecione um template"),
    departureDate: z.string().min(1, "Informe a data de partida"),
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
  totalCapacity: string;
  initialStatus: "DRAFT" | "SCHEDULED";
  driverId: string;
  vehicleId: string;
};

const EMPTY: FormState = {
  tripTemplateId: "",
  departureDate: "",
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

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === form.tripTemplateId) ?? null,
    [templates, form.tripTemplateId],
  );

  const templateHasSchedule = Boolean(
    selectedTemplate?.departureTimeOfDay && selectedTemplate?.arrivalTimeOfDay,
  );

  const previewDepartureBr = selectedTemplate?.departureTimeOfDay
    ? utcHourToBr(selectedTemplate.departureTimeOfDay)
    : null;
  const previewArrivalBr = selectedTemplate?.arrivalTimeOfDay
    ? utcHourToBr(selectedTemplate.arrivalTimeOfDay)
    : null;

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
    if (selectedTemplate && !templateHasSchedule) {
      setFieldErrors({
        tripTemplateId:
          "Template sem horário configurado — edite o template antes de criar viagens",
      });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const { driverId, vehicleId, ...rest } = parsed.data;
      await tripsService.create(orgId, {
        ...rest,
        driverId: driverId || undefined,
        vehicleId: vehicleId || undefined,
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
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        title="Nova viagem"
        description="Defina template, data e capacidade"
        footer={
          <button
            type="submit"
            form="trip-form"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Criando..." : "Criar viagem"}
          </button>
        }
      >
        <form id="trip-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Template */}
          <FormField label="Template de rota" error={fieldErrors.tripTemplateId}>
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
            {selectedTemplate && templateHasSchedule && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Partida prevista:{" "}
                <span className="font-mono font-semibold text-ink-2">{previewDepartureBr}</span> ·
                Chegada{" "}
                <span className="font-mono font-semibold text-ink-2">{previewArrivalBr}</span>{" "}
                (horário de Brasília)
              </p>
            )}
            {selectedTemplate && !templateHasSchedule && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-accent-soft px-3 py-2 text-[12px] font-medium text-ink-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-accent" strokeWidth={2} />
                <span>Template sem horário configurado — edite o template antes de criar.</span>
              </div>
            )}
          </FormField>

          {/* Date + capacity grid */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data de partida" error={fieldErrors.departureDate}>
              <Input
                type="date"
                value={form.departureDate}
                onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))}
              />
            </FormField>
            <FormField label="Capacidade" error={fieldErrors.totalCapacity}>
              <Input
                type="number"
                min="1"
                value={form.totalCapacity}
                onChange={(e) => setForm((f) => ({ ...f, totalCapacity: e.target.value }))}
                placeholder="Ex: 40"
              />
            </FormField>
          </div>

          {/* Status toggle */}
          <FormField label="Status inicial">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-line-soft p-1">
              {(["DRAFT", "SCHEDULED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, initialStatus: s }))}
                  className={
                    form.initialStatus === s
                      ? "rounded-lg bg-surface px-3 py-2 text-[12px] font-bold text-ink shadow-sm"
                      : "rounded-lg px-3 py-2 text-[12px] font-bold text-muted-foreground hover:text-ink"
                  }
                >
                  {s === "DRAFT" ? "Rascunho" : "Agendada"}
                </button>
              ))}
            </div>
            {form.initialStatus === "SCHEDULED" && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Requer motorista e veículo selecionados.
              </p>
            )}
          </FormField>

          {/* Driver + vehicle */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="Motorista"
              required={form.initialStatus === "SCHEDULED"}
              error={fieldErrors.driverId}
            >
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
                    <SelectItem key={d.id} value={d.id} textValue={driverDisplayString(d)}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          <DriverDisplayName driver={d} />
                        </span>
                        <span className="text-xs text-muted-foreground">
                          CNH {d.cnh} · Cat. {d.cnhCategories.join(", ")}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Veículo"
              required={form.initialStatus === "SCHEDULED"}
              error={fieldErrors.vehicleId}
            >
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
            </FormField>
          </div>
        </form>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-0.5 text-[12px] font-bold uppercase tracking-[0.3px] text-ink-2">
        {label}
        {required && <span className="text-danger">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] font-medium text-danger">{error}</p>}
    </div>
  );
}
