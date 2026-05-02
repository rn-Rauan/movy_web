import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MapPin, Pencil, Trash2, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingList } from "@/components/feedback/LoadingList";
import { useRole } from "@/lib/role-context";
import { templatesService } from "@/services/templates.service";
import type { TripTemplate } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/templates")({
  component: TemplatesPage,
});

const SHIFT_LABEL: Record<string, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
};

const templateSchema = z.object({
  departurePoint: z.string().trim().min(2, "Informe o ponto de partida"),
  destination: z.string().trim().min(2, "Informe o destino"),
  stops: z
    .array(z.string().trim().min(1, "Parada não pode ser vazia"))
    .min(2, "Informe ao menos 2 paradas"),
  shift: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  priceOneWay: z.coerce.number().positive("Preço inválido").optional(),
  priceReturn: z.coerce.number().positive("Preço inválido").optional(),
  priceRoundTrip: z.coerce.number().positive("Preço inválido").optional(),
  isPublic: z.boolean(),
  isRecurring: z.boolean().optional(),
});

type FormState = {
  departurePoint: string;
  destination: string;
  stops: string[];
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  priceOneWay: string;
  priceReturn: string;
  priceRoundTrip: string;
  isPublic: boolean;
  isRecurring: boolean;
};

const EMPTY_FORM: FormState = {
  departurePoint: "",
  destination: "",
  stops: ["", ""],
  shift: "MORNING",
  priceOneWay: "",
  priceReturn: "",
  priceRoundTrip: "",
  isPublic: false,
  isRecurring: false,
};

function templateToForm(tpl: TripTemplate): FormState {
  return {
    departurePoint: tpl.departurePoint,
    destination: tpl.destination,
    stops: tpl.stops.length >= 2 ? tpl.stops : [...tpl.stops, "", ""].slice(0, 2),
    shift: tpl.shift,
    priceOneWay: tpl.priceOneWay != null ? String(tpl.priceOneWay) : "",
    priceReturn: tpl.priceReturn != null ? String(tpl.priceReturn) : "",
    priceRoundTrip: tpl.priceRoundTrip != null ? String(tpl.priceRoundTrip) : "",
    isPublic: tpl.isPublic,
    isRecurring: tpl.isRecurring ?? false,
  };
}

function TemplatesPage() {
  const { adminOrgId } = useRole();
  const [templates, setTemplates] = useState<TripTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TripTemplate | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<TripTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  function loadTemplates() {
    if (!adminOrgId) return;
    templatesService
      .listByOrgId(adminOrgId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setTemplates(list);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Erro ao carregar templates";
        setError(msg);
        toast.error(msg);
      });
  }

  useEffect(() => {
    loadTemplates();
  }, [adminOrgId]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setSheetOpen(true);
  }

  function openEdit(tpl: TripTemplate) {
    setEditing(tpl);
    setForm(templateToForm(tpl));
    setFieldErrors({});
    setSheetOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      priceOneWay: form.priceOneWay ? Number(form.priceOneWay) : undefined,
      priceReturn: form.priceReturn ? Number(form.priceReturn) : undefined,
      priceRoundTrip: form.priceRoundTrip ? Number(form.priceRoundTrip) : undefined,
    };
    const parsed = templateSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        const key = e.path.join(".");
        errs[key] = e.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await templatesService.update(editing.id, parsed.data);
        setTemplates((prev) =>
          prev ? prev.map((t) => (t.id === updated.id ? updated : t)) : prev,
        );
        toast.success("Template atualizado");
      } else {
        const created = await templatesService.create(adminOrgId!, parsed.data);
        setTemplates((prev) => (prev ? [created, ...prev] : [created]));
        toast.success("Template criado");
      }
      setSheetOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar template");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await templatesService.remove(deleteTarget.id);
      setTemplates((prev) => (prev ? prev.filter((t) => t.id !== deleteTarget.id) : prev));
      toast.success("Template removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover template");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const loading = templates === null && !error;
  const list = templates ?? [];

  return (
    <AppShell title="Templates">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "template" : "templates"}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Criar template
        </Button>
      </div>

      {loading ? (
        <LoadingList count={3} height="h-24" />
      ) : list.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhum template cadastrado.
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((tpl) => (
            <Card key={tpl.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  {tpl.departurePoint} → {tpl.destination}
                </div>
                {tpl.isPublic ? (
                  <Badge variant="default">Público</Badge>
                ) : (
                  <Badge variant="outline">Privado</Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {SHIFT_LABEL[tpl.shift] ?? tpl.shift} ·{" "}
                  {tpl.stops?.length ?? 0} paradas
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(tpl)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(tpl)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[90dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{editing ? "Editar template" : "Novo template"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pb-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Origem</Label>
                <Input
                  value={form.departurePoint}
                  onChange={(e) => setForm((f) => ({ ...f, departurePoint: e.target.value }))}
                  placeholder="Ex: Terminal"
                />
                {fieldErrors.departurePoint && (
                  <p className="text-xs text-destructive">{fieldErrors.departurePoint}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Destino</Label>
                <Input
                  value={form.destination}
                  onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  placeholder="Ex: Universidade"
                />
                {fieldErrors.destination && (
                  <p className="text-xs text-destructive">{fieldErrors.destination}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Turno</Label>
              <Select
                value={form.shift}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, shift: v as typeof f.shift }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Manhã</SelectItem>
                  <SelectItem value="AFTERNOON">Tarde</SelectItem>
                  <SelectItem value="EVENING">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Paradas (mín. 2)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, stops: [...f.stops, ""] }))}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                </Button>
              </div>
              {form.stops.map((stop, i) => (
                <div key={i} className="flex gap-2">
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
                  />
                  {form.stops.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          stops: f.stops.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {fieldErrors.stops && (
                <p className="text-xs text-destructive">{fieldErrors.stops}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Preço ida (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceOneWay}
                  onChange={(e) => setForm((f) => ({ ...f, priceOneWay: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1">
                <Label>Preço volta (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceReturn}
                  onChange={(e) => setForm((f) => ({ ...f, priceReturn: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1">
                <Label>Ida e volta (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceRoundTrip}
                  onChange={(e) => setForm((f) => ({ ...f, priceRoundTrip: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                  className="rounded"
                />
                Visível no marketplace
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
                  className="rounded"
                />
                Recorrente
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Salvando..." : editing ? "Salvar alterações" : "Criar template"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover template?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.departurePoint} → {deleteTarget?.destination} será desativado. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
