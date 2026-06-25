import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CnhCategoriesField } from "./CnhCategoriesField";
import { brYmdToUtcDate, startOfBrDay } from "@/lib/timezone";
import { CNH_COMBO_MESSAGE, isValidCnhCombination } from "@/lib/cnh";
import { zodFieldErrors } from "@/lib/handle-error";
import type { CnhCategory, Driver } from "@/lib/types";

/**
 * Em modo edit, se o user não mexeu na data de validade, não exigimos que ela esteja no futuro —
 * driver com CNH já vencida precisa poder editar só as categorias sem renovar a data.
 * Já se o user mudou a data, ela precisa ser futura.
 */
function makeDriverSchema(initialExpiresAt?: string) {
  const initial = initialExpiresAt?.slice(0, 10);
  return z
    .object({
      cnh: z
        .string()
        .trim()
        .min(9, "CNH deve ter entre 9 e 12 caracteres")
        .max(12, "CNH deve ter entre 9 e 12 caracteres"),
      cnhCategories: z
        .array(z.enum(["A", "B", "C", "D", "E"]))
        .min(1, "Selecione ao menos uma categoria")
        .max(2, CNH_COMBO_MESSAGE),
      cnhExpiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida (AAAA-MM-DD)"),
    })
    .superRefine((data, ctx) => {
      if (!isValidCnhCombination(data.cnhCategories)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cnhCategories"],
          message: CNH_COMBO_MESSAGE,
        });
      }
      if (initial && data.cnhExpiresAt === initial) return;
      const today = startOfBrDay();
      const expires = brYmdToUtcDate(data.cnhExpiresAt);
      if (Number.isNaN(expires.getTime()) || expires <= today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cnhExpiresAt"],
          message: "Validade deve ser uma data futura",
        });
      }
    });
}

export type DriverFormPayload = z.infer<ReturnType<typeof makeDriverSchema>>;

type Props = {
  mode: "create" | "edit";
  initialData?: Partial<Driver>;
  submitting?: boolean;
  onSubmit: (payload: DriverFormPayload) => void;
};

type FormState = { cnh: string; cnhCategories: CnhCategory[]; cnhExpiresAt: string };

const EMPTY: FormState = { cnh: "", cnhCategories: [], cnhExpiresAt: "" };

export function DriverProfileForm({ mode, initialData, submitting, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        cnh: initialData.cnh ?? "",
        cnhCategories: initialData.cnhCategories ?? [],
        cnhExpiresAt: initialData.cnhExpiresAt ? initialData.cnhExpiresAt.slice(0, 10) : "",
      });
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const schema = makeDriverSchema(initialData?.cnhExpiresAt);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  const saveDisabled = submitting || (mode === "create" && !confirmed);
  const cnhReadOnly = mode === "edit";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "create" && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600 shrink-0" />
            <div className="text-yellow-900 dark:text-yellow-200">
              Este perfil é destinado{" "}
              <strong>apenas a motoristas que vão trabalhar para uma empresa cadastrada</strong> no
              sistema. Não ative se você é apenas passageiro.
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label>Número da CNH</Label>
        <Input
          value={form.cnh}
          onChange={(e) => setForm((f) => ({ ...f, cnh: e.target.value }))}
          placeholder="9 a 12 dígitos"
          maxLength={12}
          readOnly={cnhReadOnly}
          disabled={cnhReadOnly}
        />
        {cnhReadOnly && (
          <p className="text-xs text-muted-foreground">
            Para trocar o número da CNH, fale com um administrador.
          </p>
        )}
        {errors.cnh && <p className="text-xs text-destructive">{errors.cnh}</p>}
      </div>

      <CnhCategoriesField
        value={form.cnhCategories}
        onChange={(cats) => setForm((f) => ({ ...f, cnhCategories: cats }))}
        error={errors.cnhCategories}
      />

      <div className="space-y-1">
        <Label>Validade da CNH</Label>
        <Input
          type="date"
          value={form.cnhExpiresAt}
          onChange={(e) => setForm((f) => ({ ...f, cnhExpiresAt: e.target.value }))}
        />
        {errors.cnhExpiresAt && <p className="text-xs text-destructive">{errors.cnhExpiresAt}</p>}
      </div>

      {mode === "create" && (
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(v === true)}
            className="mt-0.5"
          />
          <span className="text-xs leading-relaxed">
            Confirmo que vou trabalhar para uma organização cadastrada no sistema.
          </span>
        </label>
      )}

      <Button type="submit" className="w-full" disabled={saveDisabled}>
        {submitting
          ? "Salvando..."
          : mode === "create"
            ? "Ativar perfil de motorista"
            : "Salvar alterações"}
      </Button>
    </form>
  );
}
