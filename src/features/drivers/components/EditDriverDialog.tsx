import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { driversService } from "@/services/drivers.service";
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
import type { Driver } from "@/lib/types";

const schema = z.object({
  cnh: z
    .string()
    .trim()
    .min(9, "CNH deve ter ao menos 9 caracteres")
    .max(11, "CNH deve ter no máximo 11 caracteres"),
  cnhCategory: z.enum(["A", "B", "C", "D", "E"]),
  cnhExpiresAt: z.string().min(1, "Informe a validade"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

type FormState = {
  cnh: string;
  cnhCategory: "A" | "B" | "C" | "D" | "E";
  cnhExpiresAt: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

type Props = {
  driver: Driver | null;
  onClose: () => void;
  onUpdated: (driver: Driver) => void;
};

export function EditDriverDialog({ driver, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<FormState>({
    cnh: "",
    cnhCategory: "B",
    cnhExpiresAt: "",
    status: "ACTIVE",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (driver) {
      setForm({
        cnh: driver.cnh,
        cnhCategory: driver.cnhCategory,
        cnhExpiresAt: driver.cnhExpiresAt ? driver.cnhExpiresAt.slice(0, 10) : "",
        status: driver.driverStatus,
      });
      setFieldErrors({});
    }
  }, [driver]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!driver) return;
    const parsed = schema.safeParse(form);
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
      const updated = await driversService.update(driver.id, parsed.data);
      onUpdated({ ...driver, ...updated });
      toast.success("Motorista atualizado");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar motorista");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!driver} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar motorista</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label>CNH</Label>
            <Input
              value={form.cnh}
              onChange={(e) => setForm((f) => ({ ...f, cnh: e.target.value }))}
              placeholder="123456789"
              maxLength={11}
            />
            {fieldErrors.cnh && <p className="text-xs text-destructive">{fieldErrors.cnh}</p>}
          </div>
          <div className="space-y-1">
            <Label>Categoria</Label>
            <Select
              value={form.cnhCategory}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, cnhCategory: v as FormState["cnhCategory"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="E">E</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.cnhCategory && (
              <p className="text-xs text-destructive">{fieldErrors.cnhCategory}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Validade da CNH</Label>
            <Input
              type="date"
              value={form.cnhExpiresAt}
              onChange={(e) => setForm((f) => ({ ...f, cnhExpiresAt: e.target.value }))}
            />
            {fieldErrors.cnhExpiresAt && (
              <p className="text-xs text-destructive">{fieldErrors.cnhExpiresAt}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v as FormState["status"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
                <SelectItem value="SUSPENDED">Suspenso</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.status && <p className="text-xs text-destructive">{fieldErrors.status}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
