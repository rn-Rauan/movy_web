import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, UserX } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { driversService } from "@/services/drivers.service";
import type { Driver, Paginated } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/drivers")({
  component: DriversPage,
});

const DRIVER_ROLE_ID = 2;

const addDriverSchema = z.object({
  userEmail: z.string().email("E-mail inválido"),
  cnh: z.string().trim().min(9, "CNH deve ter ao menos 9 caracteres"),
});

function DriversPage() {
  const { adminOrgId } = useRole();
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ userEmail: "", cnh: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<Driver | null>(null);
  const [removing, setRemoving] = useState(false);

  function loadDrivers() {
    if (!adminOrgId) return;
    driversService
      .listByOrgId(adminOrgId)
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as Paginated<Driver>).data ?? []);
        setDrivers(list);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Erro ao carregar motoristas";
        setError(msg);
        toast.error(msg);
      });
  }

  useEffect(() => {
    loadDrivers();
  }, [adminOrgId]);

  function openAdd() {
    setForm({ userEmail: "", cnh: "" });
    setFieldErrors({});
    setDialogOpen(true);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addDriverSchema.safeParse(form);
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
      setDialogOpen(false);
      setDrivers(null);
      loadDrivers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar motorista");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget || !adminOrgId) return;
    setRemoving(true);
    try {
      await driversService.removeMembership(removeTarget.userId, DRIVER_ROLE_ID, adminOrgId);
      setDrivers((prev) => (prev ? prev.filter((d) => d.id !== removeTarget.id) : prev));
      toast.success("Motorista removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover motorista");
    } finally {
      setRemoving(false);
      setRemoveTarget(null);
    }
  }

  const loading = drivers === null && !error;
  const list = drivers ?? [];

  return (
    <AppShell title="Motoristas">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "motorista" : "motoristas"}
        </p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {loading ? (
        <LoadingList count={3} height="h-20" />
      ) : error ? (
        <Card className="p-6 text-center text-sm text-destructive">{error}</Card>
      ) : list.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhum motorista cadastrado.
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((d) => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {d.userName ?? d.userEmail ?? "Motorista"}
                  </div>
                  {d.userEmail && d.userName && (
                    <div className="text-xs text-muted-foreground truncate">{d.userEmail}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span>CNH {d.cnh}</span>
                    <span>·</span>
                    <span>Cat. {d.cnhCategory}</span>
                    <span>·</span>
                    <span>Val. {new Date(d.cnhExpiresAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={d.driverStatus === "ACTIVE" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {d.driverStatus === "ACTIVE"
                      ? "Ativo"
                      : d.driverStatus === "SUSPENDED"
                        ? "Suspenso"
                        : "Inativo"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => setRemoveTarget(d)}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add driver dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar motorista</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3 mt-2">
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

      {/* Remove confirmation */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover motorista?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.userName ?? removeTarget?.userEmail ?? "Este motorista"} será
              desvinculado da organização.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
