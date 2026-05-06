import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Pencil,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Plus,
  Trash2,
  Car,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { organizationsService } from "@/services/organizations.service";
import { vehiclesService } from "@/services/vehicles.service";
import { driversService } from "@/services/drivers.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { plansService } from "@/services/plans.service";
import { ApiError } from "@/lib/api";
import { useRole } from "@/lib/role-context";
import type { Organization, Vehicle, Driver, Paginated, Plan, Subscription } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_protected/_admin/organization")({
  component: OrganizationPage,
});

// ── Schemas ──────────────────────────────────────────────────────────────────

const orgSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  cnpj: z.string().trim().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telephone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens")
    .optional()
    .or(z.literal("")),
});

const vehicleSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(7, "Placa deve ter 7 caracteres")
    .max(7, "Placa deve ter 7 caracteres"),
  model: z.string().trim().min(2, "Informe o modelo"),
  type: z.enum(["VAN", "BUS", "MINIBUS", "CAR"]),
  maxCapacity: z.coerce.number().int().min(1).max(200, "Máximo 200"),
});

// ── Constants ─────────────────────────────────────────────────────────────────

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  VAN: "Van",
  BUS: "Ônibus",
  MINIBUS: "Micro-ônibus",
  CAR: "Carro",
};

// ── Main page ─────────────────────────────────────────────────────────────────

function OrganizationPage() {
  const { adminOrgId } = useRole();
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: "",
    cnpj: "",
    email: "",
    telephone: "",
    address: "",
    slug: "",
  });
  const [orgFieldErrors, setOrgFieldErrors] = useState<Record<string, string>>({});
  const [orgSubmitting, setOrgSubmitting] = useState(false);

  const [vehiclesOpen, setVehiclesOpen] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    let cancelled = false;
    organizationsService
      .listMine()
      .then((res) => {
        if (!cancelled) setOrg(res.data?.[0] ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Erro ao carregar empresa";
          setOrgError(msg);
          toast.error(msg);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!adminOrgId) return;
    vehiclesService
      .listByOrgId(adminOrgId)
      .then((res) => setVehicles(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => setVehicles([]));
    driversService
      .listByOrgId(adminOrgId)
      .then((res) => setDrivers(Array.isArray(res) ? res : ((res as Paginated<Driver>).data ?? [])))
      .catch(() => setDrivers([]));
    subscriptionsService
      .getActive(adminOrgId)
      .then((sub) => {
        setSubscription(sub);
        if (sub?.planId) {
          plansService
            .getById(sub.planId)
            .then(setPlan)
            .catch(() => setPlan(null));
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setSubscription(null);
        else setSubscription(null);
      });
  }, [adminOrgId]);

  function openOrgEdit() {
    if (!org) return;
    setOrgForm({
      name: org.name ?? "",
      cnpj: org.cnpj ?? "",
      email: org.email ?? "",
      telephone: org.telephone ?? "",
      address: org.address ?? "",
      slug: org.slug ?? "",
    });
    setOrgFieldErrors({});
    setOrgDialogOpen(true);
  }

  async function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    const parsed = orgSchema.safeParse(orgForm);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errs[e.path.join(".")] = e.message;
      });
      setOrgFieldErrors(errs);
      return;
    }
    setOrgFieldErrors({});
    setOrgSubmitting(true);
    try {
      const updated = await organizationsService.update(org.id, parsed.data);
      setOrg(updated);
      toast.success("Empresa atualizada");
      setOrgDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setOrgSubmitting(false);
    }
  }

  if (orgError) {
    return (
      <AppShell title="Empresa">
        <ErrorCard message={orgError} />
      </AppShell>
    );
  }
  if (org === null) {
    return (
      <AppShell title="Empresa">
        <LoadingList count={3} height="h-24" />
      </AppShell>
    );
  }

  const activeVehicles = (vehicles ?? []).filter((v) => v.status !== "INACTIVE");
  const activeDrivers = (drivers ?? []).filter((d) => d.driverStatus === "ACTIVE");

  return (
    <AppShell title="Empresa">
      {/* Plan card */}
      <PlanCard
        subscription={subscription}
        plan={plan}
        vehiclesCount={(vehicles ?? []).filter((v) => v.status !== "INACTIVE").length}
        driversCount={(drivers ?? []).filter((d) => d.driverStatus === "ACTIVE").length}
      />

      {/* Org info card */}
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">{org.name}</h2>
            <p className="text-sm text-muted-foreground">/{org.slug}</p>
          </div>
          <Button size="sm" variant="outline" onClick={openOrgEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          <Field icon={<Hash className="h-4 w-4" />} label="CNPJ" value={org.cnpj} />
          <Field icon={<Mail className="h-4 w-4" />} label="E-mail" value={org.email} />
          <Field icon={<Phone className="h-4 w-4" />} label="Telefone" value={org.telephone} />
          <Field icon={<MapPin className="h-4 w-4" />} label="Endereço" value={org.address} />
          <Field icon={<Building2 className="h-4 w-4" />} label="Status" value={org.status} />
        </div>
      </Card>

      {/* Resource cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setVehiclesOpen(true)}
          className="rounded-xl border border-border bg-card p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <Car className="h-5 w-5 text-primary" />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {vehicles === null ? "—" : activeVehicles.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Veículos</div>
        </button>

        <Link
          to="/drivers"
          className="rounded-xl border border-border bg-card p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-primary" />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{drivers === null ? "—" : activeDrivers.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Motoristas</div>
        </Link>
      </div>

      {/* Org edit dialog */}
      <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOrgSubmit} className="space-y-3 mt-2">
            <Field2 label="Nome" error={orgFieldErrors.name}>
              <Input
                value={orgForm.name}
                onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field2>
            <Field2 label="Slug" error={orgFieldErrors.slug}>
              <Input
                value={orgForm.slug}
                placeholder="minha-empresa"
                onChange={(e) => setOrgForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </Field2>
            <Field2 label="CNPJ">
              <Input
                value={orgForm.cnpj}
                onChange={(e) => setOrgForm((f) => ({ ...f, cnpj: e.target.value }))}
              />
            </Field2>
            <Field2 label="E-mail" error={orgFieldErrors.email}>
              <Input
                type="email"
                value={orgForm.email}
                onChange={(e) => setOrgForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field2>
            <Field2 label="Telefone">
              <Input
                value={orgForm.telephone}
                onChange={(e) => setOrgForm((f) => ({ ...f, telephone: e.target.value }))}
              />
            </Field2>
            <Field2 label="Endereço">
              <Input
                value={orgForm.address}
                onChange={(e) => setOrgForm((f) => ({ ...f, address: e.target.value }))}
              />
            </Field2>
            <Button type="submit" className="w-full" disabled={orgSubmitting}>
              {orgSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vehicles sheet */}
      <VehiclesSheet
        open={vehiclesOpen}
        onOpenChange={setVehiclesOpen}
        orgId={adminOrgId ?? ""}
        vehicles={vehicles}
        onVehiclesChange={setVehicles}
      />
    </AppShell>
  );
}

// ── Vehicles Sheet ────────────────────────────────────────────────────────────

function VehiclesSheet({
  open,
  onOpenChange,
  orgId,
  vehicles,
  onVehiclesChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orgId: string;
  vehicles: Vehicle[] | null;
  onVehiclesChange: (fn: (prev: Vehicle[] | null) => Vehicle[] | null) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<{
    plate: string;
    model: string;
    type: "VAN" | "BUS" | "MINIBUS" | "CAR";
    maxCapacity: string;
  }>({ plate: "", model: "", type: "VAN", maxCapacity: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  function openAdd() {
    setEditTarget(null);
    setForm({ plate: "", model: "", type: "VAN", maxCapacity: "" });
    setFieldErrors({});
    setAddOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditTarget(v);
    setForm({ plate: v.plate, model: v.model, type: v.type, maxCapacity: String(v.maxCapacity) });
    setFieldErrors({});
    setAddOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = vehicleSchema.safeParse(form);
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
      if (editTarget) {
        const updated = await vehiclesService.update(editTarget.id, parsed.data);
        onVehiclesChange((prev) =>
          prev ? prev.map((v) => (v.id === updated.id ? updated : v)) : prev,
        );
        toast.success("Veículo atualizado");
      } else {
        const created = await vehiclesService.create(orgId, parsed.data);
        onVehiclesChange((prev) => (prev ? [created, ...prev] : [created]));
        toast.success("Veículo adicionado");
      }
      setAddOpen(false);
    } catch (err) {
      handleApiError(err, "Erro ao salvar veículo");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await vehiclesService.deactivate(deactivateTarget.id);
      onVehiclesChange((prev) => (prev ? prev.filter((v) => v.id !== deactivateTarget.id) : prev));
      toast.success("Veículo removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    } finally {
      setDeactivating(false);
      setDeactivateTarget(null);
    }
  }

  const activeVehicles = (vehicles ?? []).filter((v) => v.status !== "INACTIVE");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" /> Veículos
              </SheetTitle>
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          </SheetHeader>

          {vehicles === null ? (
            <LoadingList count={3} height="h-16" />
          ) : activeVehicles.length === 0 ? (
            <Card className="p-4 text-center text-sm text-muted-foreground">
              Nenhum veículo cadastrado.
            </Card>
          ) : (
            <div className="space-y-2 pb-8">
              {activeVehicles.map((v) => (
                <Card key={v.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{v.model}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {v.plate} · {VEHICLE_TYPE_LABEL[v.type] ?? v.type} · {v.maxCapacity} lugares
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(v)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeactivateTarget(v)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add / edit vehicle dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar veículo" : "Novo veículo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <Field2 label="Placa" error={fieldErrors.plate}>
              <Input
                value={form.plate}
                maxLength={7}
                placeholder="ABC1D23"
                onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))}
              />
            </Field2>
            <Field2 label="Modelo" error={fieldErrors.model}>
              <Input
                value={form.model}
                placeholder="Ex: Mercedes-Benz Sprinter"
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              />
            </Field2>
            <Field2 label="Tipo">
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as typeof f.type }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="BUS">Ônibus</SelectItem>
                  <SelectItem value="MINIBUS">Micro-ônibus</SelectItem>
                  <SelectItem value="CAR">Carro</SelectItem>
                </SelectContent>
              </Select>
            </Field2>
            <Field2 label="Capacidade máxima" error={fieldErrors.maxCapacity}>
              <Input
                type="number"
                min="1"
                max="200"
                value={form.maxCapacity}
                placeholder="Ex: 15"
                onChange={(e) => setForm((f) => ({ ...f, maxCapacity: e.target.value }))}
              />
            </Field2>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Salvando..." : editTarget ? "Salvar alterações" : "Adicionar veículo"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.model} ({deactivateTarget?.plate}) será desativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={deactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivating ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function Field2({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({
  subscription,
  plan,
  vehiclesCount,
  driversCount,
}: {
  subscription: Subscription | null | undefined;
  plan: Plan | null;
  vehiclesCount: number;
  driversCount: number;
}) {
  if (subscription === undefined) {
    return (
      <Card className="p-5 mb-4">
        <LoadingList count={1} height="h-16" />
      </Card>
    );
  }

  if (subscription === null) {
    return (
      <Card className="p-5 mb-4 text-center">
        <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
        <h3 className="text-base font-semibold">Sem plano ativo</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-3">
          Escolha um plano para liberar mais veículos, motoristas e viagens.
        </p>
        <Button size="sm" disabled>
          Escolher um plano
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge>{plan?.name ?? "Plano"}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Válido até {formatDateTime(subscription.expiresAt)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{plan ? `R$ ${plan.price.toFixed(2)}` : "—"}</div>
          <div className="text-xs text-muted-foreground">por mês</div>
        </div>
      </div>

      {plan && (
        <div className="space-y-3 mt-2">
          <UsageRow label="Veículos" used={vehiclesCount} max={plan.maxVehicles} />
          <UsageRow label="Motoristas" used={driversCount} max={plan.maxDrivers} />
        </div>
      )}
    </Card>
  );
}

function UsageRow({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  const over = used >= max;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={over ? "text-destructive font-medium" : "font-medium"}>
          {used} / {max}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
