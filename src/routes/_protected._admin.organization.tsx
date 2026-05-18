import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Pencil,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { organizationsService } from "@/services/organizations.service";
import { vehiclesService } from "@/services/vehicles.service";
import { driversService } from "@/services/drivers.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { plansService } from "@/services/plans.service";
import { ApiError } from "@/lib/api";
import { useRole } from "@/lib/role-context";
import { SchedulingConfigCard } from "@/features/scheduling/components/SchedulingConfigCard";
import type {
  Organization,
  Vehicle,
  Driver,
  Paginated,
  Plan,
  PlanUsage,
  Subscription,
} from "@/lib/types";
import { formatDateTime, formatPrice } from "@/lib/format";

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

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<PlanUsage | null | undefined>(undefined);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  function loadPlanData(orgId: string) {
    setSubscription(undefined);
    setUsage(undefined);
    setPlan(null);

    subscriptionsService
      .getActive(orgId)
      .then((sub) => {
        setSubscription(sub);
        if (sub?.planId) {
          plansService
            .getById(sub.planId)
            .then(setPlan)
            .catch(() => setPlan(null));
        }
      })
      .catch(() => setSubscription(null));

    subscriptionsService
      .getPlanUsage(orgId)
      .then(setUsage)
      .catch((err) => {
        // 403 NO_ACTIVE_SUBSCRIPTION_FORBIDDEN: org sem plano ativo
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) setUsage(null);
        else setUsage(null);
      });
  }

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
    loadPlanData(adminOrgId);
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
        usage={usage}
        onUpgrade={() => setUpgradeOpen(true)}
      />

      {/* Upgrade plan dialog */}
      <UpgradePlanDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlanId={subscription?.planId}
        currentSubscriptionId={subscription?.id}
        orgId={adminOrgId}
        onSuccess={() => {
          if (adminOrgId) loadPlanData(adminOrgId);
        }}
      />

      {/* Scheduling config card */}
      <SchedulingConfigCard orgId={adminOrgId} />

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
        <Link
          to="/vehicles"
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
        </Link>

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
    </AppShell>
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
  usage,
  onUpgrade,
}: {
  subscription: Subscription | null | undefined;
  plan: Plan | null;
  usage: PlanUsage | null | undefined;
  onUpgrade: () => void;
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
        <Button size="sm" onClick={onUpgrade}>
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
          <div className="text-lg font-semibold">{formatPrice(plan?.price)}</div>
          <div className="text-xs text-muted-foreground">por mês</div>
        </div>
      </div>

      {usage ? (
        <div className="space-y-3 mt-2">
          <UsageRow label="Veículos" used={usage.vehicles.used} max={usage.vehicles.max} />
          <UsageRow label="Motoristas" used={usage.drivers.used} max={usage.drivers.max} />
          <UsageRow
            label="Viagens este mês"
            used={usage.monthlyTrips.used}
            max={usage.monthlyTrips.max}
          />
        </div>
      ) : usage === undefined ? (
        <LoadingList count={1} height="h-12" />
      ) : null}

      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t">
        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
          <Link to="/payments">Ver pagamentos →</Link>
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onUpgrade}>
          Trocar de plano
        </Button>
      </div>
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

// ── Upgrade Plan Dialog ───────────────────────────────────────────────────────

function UpgradePlanDialog({
  open,
  onOpenChange,
  currentPlanId,
  currentSubscriptionId,
  orgId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
  currentSubscriptionId?: string;
  orgId: string | null;
  onSuccess: () => void;
}) {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedId(currentPlanId ?? "");
    setPlans(null);
    plansService
      .list()
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as Paginated<Plan>).data ?? []);
        setPlans(list.filter((p) => p.isActive));
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar planos");
        setPlans([]);
      });
  }, [open, currentPlanId]);

  async function handleConfirm() {
    if (!orgId || !selectedId || selectedId === currentPlanId) return;
    setSubmitting(true);
    try {
      if (currentSubscriptionId) {
        await subscriptionsService.changePlan(orgId, currentSubscriptionId, selectedId);
      } else {
        await subscriptionsService.create(orgId, selectedId);
      }
      toast.success("Plano atualizado");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      handleApiError(err, "Erro ao atualizar plano");
    } finally {
      setSubmitting(false);
    }
  }

  const noChange = !!currentPlanId && selectedId === currentPlanId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Escolher um plano</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {plans === null ? (
            <LoadingList count={3} height="h-20" />
          ) : plans.length === 0 ? (
            <Card className="p-4 text-sm text-center text-muted-foreground">
              Nenhum plano disponível.
            </Card>
          ) : (
            <RadioGroup value={selectedId} onValueChange={setSelectedId} className="space-y-2">
              {plans.map((p) => {
                const isCurrent = p.id === currentPlanId;
                return (
                  <Label
                    key={p.id}
                    htmlFor={`plan-${p.id}`}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50"
                  >
                    <RadioGroupItem value={p.id} id={`plan-${p.id}`} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Atual
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatPrice(p.price)}/mês · {p.maxVehicles} veículos · {p.maxDrivers}{" "}
                        motoristas · {p.maxMonthlyTrips} viagens/mês
                      </div>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          )}
        </div>
        <Button
          className="w-full mt-4"
          disabled={!selectedId || submitting || noChange}
          onClick={handleConfirm}
        >
          {submitting ? "Confirmando..." : noChange ? "Plano atual" : "Confirmar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
