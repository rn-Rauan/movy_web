import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Bus, List, Plus, User } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { tripsService } from "@/services/trips.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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

// Estilo dos campos conforme o protótipo: border line, radius 10, altura ~44, 13px/600.
const FIELD_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-muted-foreground";
const SELECT_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold data-[placeholder]:font-medium data-[placeholder]:text-muted-foreground";

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

  const selectedDriver = useMemo(
    () => drivers.find((d) => d.id === form.driverId) ?? null,
    [drivers, form.driverId],
  );
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === form.vehicleId) ?? null,
    [vehicles, form.vehicleId],
  );

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
        footer={
          <button
            type="submit"
            form="trip-form"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
            {submitting ? "Criando..." : "Criar viagem"}
          </button>
        }
      >
        <form id="trip-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Template */}
          <FormField label="Template de rota" error={fieldErrors.tripTemplateId}>
            <Select
              value={form.tripTemplateId}
              onValueChange={(v) => setForm((f) => ({ ...f, tripTemplateId: v }))}
            >
              <SelectTrigger className={SELECT_CLS}>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <List className="h-3.5 w-3.5 flex-none text-muted-foreground" strokeWidth={1.8} />
                  <SelectValue placeholder="Selecione um template…" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    {tpl.departurePoint} → {tpl.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && !templateHasSchedule && (
              <div className="mt-2 flex items-start gap-2 rounded-[10px] border border-accent/20 bg-accent-soft px-3 py-2 text-[12px] font-medium text-ink-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-accent" strokeWidth={2} />
                <span>Template sem horário configurado — edite o template antes de criar.</span>
              </div>
            )}
          </FormField>

          {/* Data de partida */}
          <FormField
            label="Data de partida"
            hint="O horário vem do template"
            error={fieldErrors.departureDate}
          >
            <Input
              type="date"
              value={form.departureDate}
              onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))}
              className={cn(FIELD_CLS, "font-mono")}
            />
          </FormField>

          {/* Capacidade total */}
          <FormField label="Capacidade total" error={fieldErrors.totalCapacity}>
            <div className="flex h-11 items-center rounded-[10px] border border-line bg-surface px-3 focus-within:ring-1 focus-within:ring-ring">
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={form.totalCapacity}
                onChange={(e) => setForm((f) => ({ ...f, totalCapacity: e.target.value }))}
                placeholder="40"
                className="min-w-0 flex-1 bg-transparent font-mono text-[13px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
              <span className="ml-1.5 flex-none text-[13px] text-muted-foreground">assentos</span>
            </div>
          </FormField>

          {/* Status inicial */}
          <FormField label="Status inicial">
            <div className="flex gap-1 rounded-[10px] border border-line bg-surface-2 p-[3px]">
              {(["DRAFT", "SCHEDULED"] as const).map((s) => {
                const active = form.initialStatus === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, initialStatus: s }))}
                    className={cn(
                      "flex-1 rounded-[7px] py-2 text-[12px] transition-colors",
                      active
                        ? "bg-surface font-extrabold text-ink shadow-sm"
                        : "font-medium text-muted-foreground hover:text-ink",
                    )}
                  >
                    {s === "DRAFT" ? "Rascunho" : "Agendada"}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] leading-[1.4] text-muted-foreground">
              Rascunho não aparece pra passageiros até você publicar.
            </p>
          </FormField>

          {/* Motorista + veículo */}
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Motorista" error={fieldErrors.driverId}>
              <Select
                value={form.driverId || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, driverId: v === "none" ? "" : v }))}
              >
                <SelectTrigger className={SELECT_CLS}>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <User
                      className="h-3.5 w-3.5 flex-none text-muted-foreground"
                      strokeWidth={1.8}
                    />
                    <span className="min-w-0 flex-1 truncate text-left">
                      {selectedDriver ? (
                        <DriverDisplayName driver={selectedDriver} />
                      ) : (
                        <span className="font-medium text-muted-foreground">Sem motorista</span>
                      )}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem motorista</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id} textValue={driverDisplayString(d)}>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          <DriverDisplayName driver={d} />
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          CNH {d.cnh} ({d.cnhCategories.join(", ")})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Veículo" error={fieldErrors.vehicleId}>
              <Select
                value={form.vehicleId || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v === "none" ? "" : v }))}
              >
                <SelectTrigger className={SELECT_CLS}>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Bus
                      className="h-3.5 w-3.5 flex-none text-muted-foreground"
                      strokeWidth={1.8}
                    />
                    <span className="min-w-0 flex-1 truncate text-left">
                      {selectedVehicle ? (
                        `${selectedVehicle.model} — ${selectedVehicle.plate}`
                      ) : (
                        <span className="font-medium text-muted-foreground">Sem veículo</span>
                      )}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem veículo</SelectItem>
                  {vehicles
                    .filter((v) => v.status !== "INACTIVE")
                    .map((v) => (
                      <SelectItem key={v.id} value={v.id} className="truncate">
                        {v.model} — {v.plate}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Aviso destacado */}
          <div className="flex items-start gap-2 rounded-[10px] border border-accent/20 bg-accent-soft px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-accent" strokeWidth={2} />
            <p className="text-[11px] leading-[1.45] text-ink-2">
              Sem motorista e veículo, a viagem fica como{" "}
              <strong className="font-bold">Rascunho</strong> até você completar.
            </p>
          </div>
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
