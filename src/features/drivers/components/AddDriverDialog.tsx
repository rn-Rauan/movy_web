import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { driversService } from "@/services/drivers.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const schema = z.object({
  userEmail: z.string().email("E-mail inválido"),
  cnh: z.string().trim().min(9, "CNH deve ter ao menos 9 caracteres"),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded: () => void;
};

export function AddDriverDialog({ open, onOpenChange, onAdded }: Props) {
  const [form, setForm] = useState({ userEmail: "", cnh: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ userEmail: "", cnh: "" });
      setFieldErrors({});
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
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
      await driversService.addToOrg(parsed.data.userEmail, parsed.data.cnh);
      toast.success("Motorista adicionado");
      onOpenChange(false);
      onAdded();
    } catch (err) {
      handleApiError(err, "Erro ao adicionar motorista");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar motorista</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <p className="text-xs text-muted-foreground">
            O usuário precisa ter um perfil de motorista cadastrado no sistema.
          </p>
          <div className="space-y-1">
            <Label>E-mail do motorista</Label>
            <Input
              type="email"
              value={form.userEmail}
              onChange={(e) => setForm((f) => ({ ...f, userEmail: e.target.value }))}
              placeholder="motorista@email.com"
            />
            {fieldErrors.userEmail && (
              <p className="text-xs text-destructive">{fieldErrors.userEmail}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>CNH</Label>
            <Input
              value={form.cnh}
              onChange={(e) => setForm((f) => ({ ...f, cnh: e.target.value }))}
              placeholder="123456789"
            />
            {fieldErrors.cnh && <p className="text-xs text-destructive">{fieldErrors.cnh}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Adicionando..." : "Adicionar motorista"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}