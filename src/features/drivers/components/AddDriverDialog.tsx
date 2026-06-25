import { useEffect, useState } from "react";
import { Info, Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { zodFieldErrors } from "@/lib/handle-error";
import { FormApiError } from "@/components/feedback/FormError";
import { driversService } from "@/services/drivers.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet, BottomSheetContent } from "@/components/visual/BottomSheet";
import { cn } from "@/lib/utils";

const schema = z.object({
  userEmail: z.string().email("E-mail inválido"),
  cnh: z.string().trim().min(9, "CNH deve ter ao menos 9 caracteres"),
});

// Estilo dos campos conforme o padrão dos modais (TripFormSheet): border line, radius 10, ~44px.
const FIELD_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-muted-foreground";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded: () => void;
};

export function AddDriverDialog({ open, onOpenChange, onAdded }: Props) {
  const [form, setForm] = useState({ userEmail: "", cnh: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ userEmail: "", cnh: "" });
      setFieldErrors({});
      setSubmitError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await driversService.addToOrg(parsed.data.userEmail, parsed.data.cnh);
      toast.success("Motorista adicionado");
      onOpenChange(false);
      onAdded();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        title="Adicionar motorista"
        footer={
          <button
            type="submit"
            form="add-driver-form"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
            {submitting ? "Adicionando..." : "Adicionar motorista"}
          </button>
        }
      >
        <form id="add-driver-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormApiError error={submitError} />
          {/* Aviso explicativo */}
          <div className="flex items-start gap-2 rounded-[10px] border border-info/20 bg-info-soft px-3 py-2.5">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-none text-info" strokeWidth={2} />
            <p className="text-[11px] leading-[1.45] text-ink-2">
              O usuário precisa ter um <strong className="font-bold">perfil de motorista</strong>{" "}
              cadastrado no sistema. Você o vincula à organização pelo e-mail + CNH dele.
            </p>
          </div>

          <FormField label="E-mail do motorista" error={fieldErrors.userEmail}>
            <Input
              type="email"
              value={form.userEmail}
              onChange={(e) => setForm((f) => ({ ...f, userEmail: e.target.value }))}
              placeholder="motorista@email.com"
              className={FIELD_CLS}
            />
          </FormField>

          <FormField label="CNH" error={fieldErrors.cnh}>
            <Input
              value={form.cnh}
              inputMode="numeric"
              onChange={(e) => setForm((f) => ({ ...f, cnh: e.target.value }))}
              placeholder="123456789"
              className={cn(FIELD_CLS, "font-mono")}
            />
          </FormField>
        </form>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[12px] font-bold tracking-[-0.1px] text-ink">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-[11px] font-medium text-danger">{error}</p>}
    </div>
  );
}
