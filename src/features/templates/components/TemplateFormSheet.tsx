import { useEffect, useState } from "react";
import { Bus, Check as CheckIcon, Plus, User, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { HHMM_REGEX, brHourToUtc, utcHourToBr } from "@/lib/timezone";
import { templatesService } from "@/services/templates.service";
import { driversService } from "@/services/drivers.service";
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
import { DriverDisplayName } from "@/features/drivers/components/DriverDisplayName";
import { driverDisplayString } from "@/features/drivers/lib/driver-display";
import { cn } from "@/lib/utils";
import type { Driver, TripTemplate, Vehicle, Weekday } from "@/lib/types";

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: "SUNDAY", label: "Dom" },
  { value: "MONDAY", label: "Seg" },
  { value: "TUESDAY", label: "Ter" },
  { value: "WEDNESDAY", label: "Qua" },
  { value: "THURSDAY", label: "Qui" },
  { value: "FRIDAY", label: "Sex" },
  { value: "SATURDAY", label: "Sáb" },
];

const SHIFTS = [
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
] as const;

const templateSchema = z
  .object({
    departurePoint: z.string().trim().min(2, "Informe o ponto de partida"),
    destination: z.string().trim().min(2, "Informe o destino"),
    stops: z
      .array(z.string().trim().min(1, "Parada não pode ser vazia"))
      .min(2, "Informe ao menos 2 paradas"),
    shift: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
    departureTimeOfDay: z.string().regex(HHMM_REGEX, "Use o formato HH:mm (24h)"),
    arrivalTimeOfDay: z.string().regex(HHMM_REGEX, "Use o formato HH:mm (24h)"),
    defaultCapacity: z.coerce.number().int().min(1, "Capacidade deve ser ao menos 1"),
    defaultDriverId: z.string().uuid().nullable().optional(),
    defaultVehicleId: z.string().uuid().nullable().optional(),
    priceOneWay: z.coerce.number().positive("Preço inválido").optional(),
    priceReturn: z.coerce.number().positive("Preço inválido").optional(),
    priceRoundTrip: z.coerce.number().positive("Preço inválido").optional(),
    isPublic: z.boolean(),
    isRecurring: z.boolean().optional(),
    frequency: z
      .array(z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]))
      .optional(),
    minRevenue: z.coerce.number().positive("Receita mínima inválida").optional(),
    autoCancelEnabled: z.boolean().optional(),
    autoCancelOffset: z.coerce.number().int().positive("Tempo inválido").optional(),
  })
  .superRefine((data, ctx) => {
    const hasAnyPrice =
      data.priceOneWay != null || data.priceReturn != null || data.priceRoundTrip != null;
    if (!hasAnyPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["priceOneWay"],
        message: "Informe ao menos um preço (ida, volta ou ida e volta)",
      });
    }
    if (data.isRecurring && (!data.frequency || data.frequency.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["frequency"],
        message: "Selecione ao menos um dia da semana",
      });
    }
    if (data.autoCancelEnabled) {
      if (data.minRevenue == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minRevenue"],
          message: "Informe a receita mínima",
        });
      }
      if (data.autoCancelOffset == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["autoCancelOffset"],
          message: "Informe quantos minutos antes",
        });
      }
    }
  });

type FormState = {
  departurePoint: string;
  destination: string;
  stops: string[];
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  departureTimeOfDay: string;
  arrivalTimeOfDay: string;
  defaultCapacity: string;
  defaultDriverId: string;
  defaultVehicleId: string;
  priceOneWay: string;
  priceReturn: string;
  priceRoundTrip: string;
  isPublic: boolean;
  isRecurring: boolean;
  frequency: Weekday[];
  minRevenue: string;
  autoCancelEnabled: boolean;
  autoCancelOffset: string;
};

const NONE = "__none__";

// Estilo dos campos conforme o protótipo: border line, radius 10, ~44px, 13px/600.
const FIELD_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-muted-foreground";
const SELECT_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold data-[placeholder]:font-medium data-[placeholder]:text-muted-foreground";

const EMPTY_FORM: FormState = {
  departurePoint: "",
  destination: "",
  stops: ["", ""],
  shift: "MORNING",
  departureTimeOfDay: "",
  arrivalTimeOfDay: "",
  defaultCapacity: "",
  defaultDriverId: "",
  defaultVehicleId: "",
  priceOneWay: "",
  priceReturn: "",
  priceRoundTrip: "",
  isPublic: false,
  isRecurring: false,
  frequency: [],
  minRevenue: "",
  autoCancelEnabled: false,
  autoCancelOffset: "",
};

function templateToForm(tpl: TripTemplate): FormState {
  return {
    departurePoint: tpl.departurePoint,
    destination: tpl.destination,
    stops: tpl.stops.length >= 2 ? tpl.stops : [...tpl.stops, "", ""].slice(0, 2),
    shift: tpl.shift,
    departureTimeOfDay: utcHourToBr(tpl.departureTimeOfDay) ?? "",
    arrivalTimeOfDay: utcHourToBr(tpl.arrivalTimeOfDay) ?? "",
    defaultCapacity: tpl.defaultCapacity != null ? String(tpl.defaultCapacity) : "",
    defaultDriverId: tpl.defaultDriverId ?? "",
    defaultVehicleId: tpl.defaultVehicleId ?? "",
    priceOneWay: tpl.priceOneWay != null ? String(tpl.priceOneWay) : "",
    priceReturn: tpl.priceReturn != null ? String(tpl.priceReturn) : "",
    priceRoundTrip: tpl.priceRoundTrip != null ? String(tpl.priceRoundTrip) : "",
    isPublic: tpl.isPublic,
    isRecurring: tpl.isRecurring ?? false,
    frequency: tpl.frequency ?? [],
    minRevenue: tpl.minRevenue != null ? String(tpl.minRevenue) : "",
    autoCancelEnabled: tpl.autoCancelEnabled ?? false,
    autoCancelOffset: tpl.autoCancelOffset != null ? String(tpl.autoCancelOffset) : "",
  };
}

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  orgId: string | null | undefined;
  editing: TripTemplate | null;
  onCreated: (tpl: TripTemplate) => void;
  onUpdated: (tpl: TripTemplate) => void;
};

export function TemplateFormSheet({
  open,
  onOpenChange,
  orgId,
  editing,
  onCreated,
  onUpdated,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (open) {
      setForm(editing ? templateToForm(editing) : EMPTY_FORM);
      setFieldErrors({});
    }
  }, [open, editing]);

  useEffect(() => {
    if (!open || !orgId) return;
    driversService
      .listByOrgId(orgId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setDrivers(list.filter((d) => d.driverStatus === "ACTIVE"));
      })
      .catch(() => {});
    vehiclesService
      .listByOrgId(orgId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setVehicles(list.filter((v) => v.status === "ACTIVE"));
      })
      .catch(() => {});
  }, [open, orgId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      defaultCapacity: form.defaultCapacity ? Number(form.defaultCapacity) : undefined,
      defaultDriverId: form.defaultDriverId ? form.defaultDriverId : null,
      defaultVehicleId: form.defaultVehicleId ? form.defaultVehicleId : null,
      priceOneWay: form.priceOneWay ? Number(form.priceOneWay) : undefined,
      priceReturn: form.priceReturn ? Number(form.priceReturn) : undefined,
      priceRoundTrip: form.priceRoundTrip ? Number(form.priceRoundTrip) : undefined,
      frequency: form.isRecurring && form.frequency.length > 0 ? form.frequency : undefined,
      minRevenue: form.autoCancelEnabled && form.minRevenue ? Number(form.minRevenue) : undefined,
      autoCancelOffset:
        form.autoCancelEnabled && form.autoCancelOffset ? Number(form.autoCancelOffset) : undefined,
    };
    const parsed = templateSchema.safeParse(payload);
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
    const departureUtc = brHourToUtc(parsed.data.departureTimeOfDay);
    const arrivalUtc = brHourToUtc(parsed.data.arrivalTimeOfDay);
    if (!departureUtc || !arrivalUtc) {
      setFieldErrors({ departureTimeOfDay: "Use o formato HH:mm (24h)" });
      setSubmitting(false);
      return;
    }
    const apiPayload = {
      ...parsed.data,
      departureTimeOfDay: departureUtc,
      arrivalTimeOfDay: arrivalUtc,
    };
    try {
      if (editing) {
        const updated = await templatesService.update(editing.id, apiPayload);
        onUpdated(updated);
        toast.success("Template atualizado");
      } else {
        if (!orgId) return;
        const created = await templatesService.create(orgId, apiPayload);
        onCreated(created);
        toast.success("Template criado");
      }
      onOpenChange(false);
    } catch (err) {
      handleApiError(err, "Erro ao salvar template");
    } finally {
      setSubmitting(false);
    }
  }

  const bothDefaults = Boolean(form.defaultDriverId && form.defaultVehicleId);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        sheetTop={56}
        title={editing ? "Editar template" : "Novo template"}
        footer={
          <button
            type="submit"
            form="template-form"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {!editing && <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />}
            {submitting ? "Salvando..." : editing ? "Salvar alterações" : "Criar template"}
          </button>
        }
      >
        <form id="template-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Origem / destino */}
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Origem" error={fieldErrors.departurePoint}>
              <Input
                value={form.departurePoint}
                onChange={(e) => setForm((f) => ({ ...f, departurePoint: e.target.value }))}
                placeholder="Terminal"
                className={FIELD_CLS}
              />
            </FormField>
            <FormField label="Destino" error={fieldErrors.destination}>
              <Input
                value={form.destination}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                placeholder="Universidade"
                className={FIELD_CLS}
              />
            </FormField>
          </div>

          {/* Turno segmented */}
          <FormField label="Turno">
            <div className="flex gap-1 rounded-[10px] border border-line bg-surface-2 p-[3px]">
              {SHIFTS.map((s) => {
                const active = form.shift === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, shift: s.value }))}
                    className={cn(
                      "flex-1 rounded-[7px] py-2 text-[12px] transition-colors",
                      active
                        ? "bg-surface font-extrabold text-ink shadow-sm"
                        : "font-medium text-muted-foreground hover:text-ink",
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </FormField>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Partida" error={fieldErrors.departureTimeOfDay}>
              <Input
                type="time"
                value={form.departureTimeOfDay}
                onChange={(e) => setForm((f) => ({ ...f, departureTimeOfDay: e.target.value }))}
                className={cn(FIELD_CLS, "font-mono")}
              />
            </FormField>
            <FormField label="Chegada" error={fieldErrors.arrivalTimeOfDay}>
              <Input
                type="time"
                value={form.arrivalTimeOfDay}
                onChange={(e) => setForm((f) => ({ ...f, arrivalTimeOfDay: e.target.value }))}
                className={cn(FIELD_CLS, "font-mono")}
              />
            </FormField>
          </div>
          <p className="-mt-2 text-[11px] leading-[1.4] text-muted-foreground">
            Horários em Brasília (UTC−3). Se a viagem cruza meia-noite, a chegada pode ser anterior
            à partida.
          </p>

          {/* Capacidade padrão */}
          <FormField label="Capacidade padrão" error={fieldErrors.defaultCapacity}>
            <SuffixInput
              suffix="assentos"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.defaultCapacity}
              onChange={(e) => setForm((f) => ({ ...f, defaultCapacity: e.target.value }))}
              placeholder="20"
            />
          </FormField>

          {/* Motorista + veículo padrão */}
          <div className="grid grid-cols-2 gap-2.5">
            <FormField label="Motorista padrão">
              <Select
                value={form.defaultDriverId || NONE}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, defaultDriverId: v === NONE ? "" : v }))
                }
              >
                <SelectTrigger className={SELECT_CLS}>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <User
                      className="h-3.5 w-3.5 flex-none text-muted-foreground"
                      strokeWidth={1.8}
                    />
                    <SelectValue placeholder="Nenhum" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Nenhum</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id} textValue={driverDisplayString(d)}>
                      <DriverDisplayName driver={d} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Veículo padrão">
              <Select
                value={form.defaultVehicleId || NONE}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, defaultVehicleId: v === NONE ? "" : v }))
                }
              >
                <SelectTrigger className={SELECT_CLS}>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Bus
                      className="h-3.5 w-3.5 flex-none text-muted-foreground"
                      strokeWidth={1.8}
                    />
                    <SelectValue placeholder="Nenhum" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Nenhum</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.model} — {v.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <p className="-mt-2 text-[11px] leading-[1.4] text-muted-foreground">
            {bothDefaults
              ? "Com motorista e veículo padrão, as viagens geradas saem direto como Agendada (sem revisão)."
              : "Sem os dois, as viagens geradas saem como Rascunho e exigem atribuição manual."}
          </p>

          {/* Paradas */}
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <Label className="text-[12px] font-bold tracking-[-0.1px] text-ink">
                Paradas <span className="font-medium text-muted-foreground">· mín. 2</span>
              </Label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, stops: [...f.stops, ""] }))}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-accent transition hover:opacity-80"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                Adicionar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-line-soft font-mono text-[11px] font-extrabold text-ink-2">
                    {i + 1}
                  </div>
                  <Input
                    value={stop}
                    onChange={(e) =>
                      setForm((f) => {
                        const stops = [...f.stops];
                        stops[i] = e.target.value;
                        return { ...f, stops };
                      })
                    }
                    placeholder={`Parada ${i + 1}`}
                    className={FIELD_CLS}
                  />
                  {form.stops.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          stops: f.stops.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-line text-muted-foreground transition hover:bg-line-soft hover:text-danger"
                      aria-label="Remover parada"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {fieldErrors.stops && (
              <p className="mt-1 text-[11px] font-medium text-danger">{fieldErrors.stops}</p>
            )}
          </div>

          {/* Preços 3 colunas */}
          <div>
            <Label className="mb-1.5 block text-[12px] font-bold tracking-[-0.1px] text-ink">
              Preços
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <PriceCard
                label="Ida"
                value={form.priceOneWay}
                onChange={(v) => setForm((f) => ({ ...f, priceOneWay: v }))}
              />
              <PriceCard
                label="Volta"
                value={form.priceReturn}
                onChange={(v) => setForm((f) => ({ ...f, priceReturn: v }))}
              />
              <PriceCard
                label="Ida + volta"
                value={form.priceRoundTrip}
                onChange={(v) => setForm((f) => ({ ...f, priceRoundTrip: v }))}
                accent
              />
            </div>
            {fieldErrors.priceOneWay && (
              <p className="mt-1 text-[11px] font-medium text-danger">{fieldErrors.priceOneWay}</p>
            )}
          </div>

          {/* Bloco de opções */}
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
            <Check
              label="Visível no marketplace"
              sub="Apareça na busca pública pra novos passageiros."
              checked={form.isPublic}
              onChange={(c) => setForm((f) => ({ ...f, isPublic: c }))}
            />
            <Check
              label="Recorrente"
              sub="O agendamento automático gera essas viagens periodicamente."
              checked={form.isRecurring}
              onChange={(c) => setForm((f) => ({ ...f, isRecurring: c }))}
            />
            <Check
              label="Auto-cancelar se receita mínima não for atingida"
              sub="Cancela viagens com baixa inscrição antes da partida."
              checked={form.autoCancelEnabled}
              onChange={(c) => setForm((f) => ({ ...f, autoCancelEnabled: c }))}
            />
          </div>

          {/* Frequency (revela quando recorrente) */}
          {form.isRecurring && (
            <FormField label="Dias da semana" error={fieldErrors.frequency}>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d) => {
                  const active = form.frequency.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          frequency: active
                            ? f.frequency.filter((v) => v !== d.value)
                            : [...f.frequency, d.value],
                        }))
                      }
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[12px] font-bold transition",
                        active
                          ? "bg-ink text-white"
                          : "border border-line bg-surface text-ink-2 hover:bg-surface-2",
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </FormField>
          )}

          {/* Auto-cancel detalhes (revela quando ativo) */}
          {form.autoCancelEnabled && (
            <div className="grid grid-cols-2 gap-2.5">
              <FormField label="Receita mínima" error={fieldErrors.minRevenue}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minRevenue}
                  onChange={(e) => setForm((f) => ({ ...f, minRevenue: e.target.value }))}
                  placeholder="0,00"
                  className={cn(FIELD_CLS, "font-mono")}
                />
              </FormField>
              <FormField label="Minutos antes" error={fieldErrors.autoCancelOffset}>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.autoCancelOffset}
                  onChange={(e) => setForm((f) => ({ ...f, autoCancelOffset: e.target.value }))}
                  placeholder="60"
                  className={cn(FIELD_CLS, "font-mono")}
                />
              </FormField>
            </div>
          )}
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

/** Input com sufixo textual dentro da borda (ex.: "assentos"), no estilo do protótipo. */
function SuffixInput({
  suffix,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { suffix: string }) {
  return (
    <div className="flex h-11 items-center rounded-[10px] border border-line bg-surface px-3 focus-within:ring-1 focus-within:ring-ring">
      <input
        {...props}
        className={cn(
          "min-w-0 flex-1 bg-transparent font-mono text-[13px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted-foreground",
          className,
        )}
      />
      <span className="ml-1.5 flex-none text-[13px] text-muted-foreground">{suffix}</span>
    </div>
  );
}

/** Card de preço editável no estilo do protótipo (label uppercase + R$ + valor mono). */
function PriceCard({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border px-3 py-2.5",
        accent ? "border-accent/30 bg-accent-soft" : "border-line bg-surface-2",
      )}
    >
      <div
        className={cn(
          "text-[10px] font-bold uppercase tracking-[0.3px]",
          accent ? "text-accent" : "text-muted-foreground",
        )}
      >
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-[10px] font-bold text-muted-foreground">R$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0,00"
          className="min-w-0 flex-1 bg-transparent font-mono text-[16px] font-extrabold tracking-[-0.5px] text-ink outline-none placeholder:font-normal placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

/** Checkbox no estilo do protótipo: caixa 18×18 ink quando marcada, label + sub. */
function Check({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "mt-px flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] border-[1.8px] transition-colors",
          checked ? "border-ink bg-ink text-white" : "border-line bg-transparent text-transparent",
        )}
      >
        <CheckIcon className="h-[11px] w-[11px]" strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-ink">{label}</span>
        {sub && (
          <span className="mt-0.5 block text-[11px] leading-[1.4] text-muted-foreground">
            {sub}
          </span>
        )}
      </span>
    </label>
  );
}
