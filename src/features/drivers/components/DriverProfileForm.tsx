import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Driver } from "@/lib/types";

const driverSchema = z
  .object({
    cnh: z
      .string()
      .trim()
      .min(9, "CNH deve ter entre 9 e 12 caracteres")
      .max(12, "CNH deve ter entre 9 e 12 caracteres"),
    cnhCategory: z.enum(["A", "B", "C", "D", "E"], {
      errorMap: () => ({ message: "Selecione a categoria" }),
    }),
    cnhExpiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida (AAAA-MM-DD)"),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expires = new Date(`${data.cnhExpiresAt}T00:00:00`);
    if (Number.isNaN(expires.getTime()) || expires <= today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cnhExpiresAt"],
        message: "Validade deve ser uma data futura",
      });
    }
  });

export type DriverFormPayload = z.infer<typeof driverSchema>;

type Props = {
  mode: "create" | "edit";
  initialData?: Partial<Driver>;
  submitting?: boolean;
  onSubmit: (payload: DriverFormPayload) => void;
};

const EMPTY = { cnh: "", cnhCategory: "", cnhExpiresAt: "" };

export function DriverProfileForm({ mode, initialData, submitting, onSubmit }: Props) {
  const [form, setForm] = useState<{ cnh: string; cnhCategory: string; cnhExpiresAt: string }>(
    EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        cnh: initialData.cnh ?? "",
        cnhCategory: initialData.cnhCategory ?? "",
        cnhExpiresAt: initialData.cnhExpiresAt ? initialData.cnhExpiresAt.slice(0, 10) : "",
      });
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = driverSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        errs[err.path.join(".")] = err.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  const saveDisabled = submitting || (mode === "create" && !confirmed);

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
        />
        {errors.cnh && <p className="text-xs text-destructive">{errors.cnh}</p>}
      </div>

      <div className="space-y-1">
        <Label>Categoria</Label>
        <Select
          value={form.cnhCategory}
          onValueChange={(v) => setForm((f) => ({ ...f, cnhCategory: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {(["A", "B", "C", "D", "E"] as const).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cnhCategory && <p className="text-xs text-destructive">{errors.cnhCategory}</p>}
      </div>

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
