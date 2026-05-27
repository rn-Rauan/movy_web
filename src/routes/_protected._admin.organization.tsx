import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Pencil,
  Mail,
  Phone,
  MapPin,
  Hash,
  Car,
  Users,
  ChevronRight,
  Sparkles,
  CreditCard,
  ArrowUpRight,
  Bus,
  Zap,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet, BottomSheetContent } from "@/components/visual/BottomSheet";
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
import { formatDateTime, formatPrice, isUnlimitedPlanLimit } from "@/lib/format";
import { cn } from "@/lib/utils";

// Estilo de campo conforme o padrão dos modais (BottomSheet): border line, radius 10, ~44px.
const FIELD_CLS =
  "h-11 rounded-[10px] border-line bg-surface text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-muted-foreground";

export const Route = createFileRoute("/_protected/_admin/organization")({
  component: OrganizationPage,
});

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

function orgInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

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
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) setUsage(null);
        else setUsage(null);
      });
  }

  useEffect(() => {
    if (!adminOrgId) return;
    let cancelled = false;
    organizationsService
      .listMine()
      .then((res) => {
        if (cancelled) return;
        const list = res.data ?? [];
        const match = list.find((o) => o.id === adminOrgId) ?? list[0] ?? null;
        setOrg(match);
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
  }, [adminOrgId]);

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
  const isOrgActive = (org.status ?? "ACTIVE").toUpperCase() === "ACTIVE";

  return (
    <AppShell title="Empresa">
      <div className="flex flex-col gap-3.5">
        <PlanCard
          subscription={subscription}
          plan={plan}
          usage={usage}
          onUpgrade={() => setUpgradeOpen(true)}
        />

        <ShareLinkCard slug={org.slug} name={org.name} />

        <SchedulingConfigCard orgId={adminOrgId} />

        {/* Company info card */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-accent-soft text-[16px] font-extrabold tracking-[-0.3px] text-accent">
                {orgInitials(org.name)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[16px] font-extrabold tracking-[-0.3px] text-ink">
                  {org.name}
                </h2>
                <p className="font-mono text-[12px] text-muted-foreground">/{org.slug}</p>
              </div>
            </div>
            <button
              onClick={openOrgEdit}
              className="inline-flex flex-none items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink-2 transition hover:bg-line-soft"
            >
              <Pencil className="h-3 w-3" strokeWidth={1.8} />
              Editar
            </button>
          </div>

          <div className="flex flex-col">
            <CompactInfoRow icon={Hash} label="CNPJ" value={org.cnpj} mono />
            <CompactInfoRow icon={Mail} label="E-mail" value={org.email} />
            <CompactInfoRow icon={Phone} label="Telefone" value={org.telephone} mono />
            <CompactInfoRow icon={MapPin} label="Endereço" value={org.address} />
            <CompactInfoRow
              icon={Zap}
              label="Status"
              last
              valueNode={
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 font-bold",
                    isOrgActive ? "text-success" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isOrgActive ? "bg-success" : "bg-muted-foreground",
                    )}
                  />
                  {isOrgActive ? "Ativa" : (org.status ?? "—")}
                </span>
              }
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            to="/vehicles"
            icon={Car}
            value={vehicles === null ? "—" : activeVehicles.length}
            label={activeVehicles.length === 1 ? "Veículo cadastrado" : "Veículos cadastrados"}
          />
          <StatCard
            to="/drivers"
            icon={Users}
            value={drivers === null ? "—" : activeDrivers.length}
            label={activeDrivers.length === 1 ? "Motorista ativo" : "Motoristas ativos"}
          />
        </div>
      </div>

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

      {/* Org edit sheet */}
      <BottomSheet open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
        <BottomSheetContent
          title="Editar empresa"
          footer={
            <button
              type="submit"
              form="org-form"
              disabled={orgSubmitting}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {orgSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          }
        >
          <form id="org-form" onSubmit={handleOrgSubmit} className="flex flex-col gap-4">
            <Field2 label="Nome" error={orgFieldErrors.name}>
              <Input
                value={orgForm.name}
                onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
                className={FIELD_CLS}
              />
            </Field2>
            <Field2 label="Slug" error={orgFieldErrors.slug}>
              <Input
                value={orgForm.slug}
                placeholder="minha-empresa"
                onChange={(e) => setOrgForm((f) => ({ ...f, slug: e.target.value }))}
                className={FIELD_CLS}
              />
            </Field2>
            <Field2 label="CNPJ">
              <Input
                value={orgForm.cnpj}
                onChange={(e) => setOrgForm((f) => ({ ...f, cnpj: e.target.value }))}
                className={FIELD_CLS}
              />
            </Field2>
            <Field2 label="E-mail" error={orgFieldErrors.email}>
              <Input
                type="email"
                value={orgForm.email}
                onChange={(e) => setOrgForm((f) => ({ ...f, email: e.target.value }))}
                className={FIELD_CLS}
              />
            </Field2>
            <Field2 label="Telefone">
              <Input
                value={orgForm.telephone}
                onChange={(e) => setOrgForm((f) => ({ ...f, telephone: e.target.value }))}
                className={FIELD_CLS}
              />
            </Field2>
            <Field2 label="Endereço">
              <Input
                value={orgForm.address}
                onChange={(e) => setOrgForm((f) => ({ ...f, address: e.target.value }))}
                className={FIELD_CLS}
              />
            </Field2>
          </form>
        </BottomSheetContent>
      </BottomSheet>
    </AppShell>
  );
}

function CompactInfoRow({
  icon: Icon,
  label,
  value,
  valueNode,
  mono,
  last,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  valueNode?: React.ReactNode;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5", !last && "border-b border-line-soft")}>
      <Icon className="h-[15px] w-[15px] flex-none text-muted-foreground" strokeWidth={1.7} />
      <div className="w-[70px] flex-none text-[11px] font-semibold uppercase tracking-[0.2px] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "ml-auto min-w-0 truncate text-right text-[13px] font-semibold text-ink",
          mono && "font-mono",
        )}
      >
        {valueNode ?? value ?? "—"}
      </div>
    </div>
  );
}

function StatCard({
  to,
  icon: Icon,
  value,
  label,
}: {
  to: string;
  icon: LucideIcon;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-line bg-surface p-3.5 transition hover:bg-surface-2"
    >
      <div className="mb-2 flex items-center justify-between">
        <Icon className="h-5 w-5 text-ink-2" strokeWidth={1.7} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
      </div>
      <div className="font-mono text-[26px] font-extrabold leading-none tracking-[-1px] text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-[12px] font-semibold text-muted-foreground">{label}</div>
    </Link>
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

// ─── Share Link Card ──────────────────────────────────────────────────────────

function ShareLinkCard({ slug, name }: { slug?: string; name?: string }) {
  const [copied, setCopied] = useState(false);
  if (!slug) return null;

  const host = typeof window !== "undefined" ? window.location.host : "";
  const path = `/public/organizations/${slug}`;
  const absoluteUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  async function handleShare() {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({
          title: name ?? "Página pública",
          url: absoluteUrl,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    handleCopy();
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold tracking-[-0.2px] text-ink">
            Sua página pública
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Compartilhe pra clientes verem suas viagens
          </div>
        </div>
      </div>

      <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface-2">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden px-3 py-2.5 font-mono text-[12.5px] font-semibold">
          <span className="truncate text-muted-foreground">{host}/public/organizations/</span>
          <span className="truncate font-extrabold text-accent">{slug}</span>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex flex-none items-center gap-1.5 border-l border-line px-3.5 text-[12px] font-bold text-white transition",
            copied ? "bg-success" : "bg-ink hover:opacity-90",
          )}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
          )}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <div className="mt-2 flex gap-1.5">
        <button
          onClick={handleShare}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] font-bold text-ink-2 transition hover:bg-surface-2"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          Compartilhar
        </button>
        <Link
          to="/public/organizations/$slug"
          params={{ slug }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] font-bold text-ink-2 transition hover:bg-surface-2"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
          Abrir
        </Link>
      </div>
    </div>
  );
}

// ─── Plan Card (hero) ─────────────────────────────────────────────────────────

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
      <div className="rounded-2xl border border-line bg-surface p-4">
        <LoadingList count={1} height="h-16" />
      </div>
    );
  }

  if (subscription === null) {
    return (
      <div className="rounded-2xl border border-accent/15 bg-accent-soft p-5 text-center">
        <Sparkles className="mx-auto mb-2 h-6 w-6 text-accent" strokeWidth={1.8} />
        <h3 className="text-[15px] font-extrabold tracking-[-0.2px] text-ink">Sem plano ativo</h3>
        <p className="mx-auto mt-1 mb-3.5 max-w-[280px] text-[12px] text-ink-2">
          Escolha um plano para liberar mais veículos, motoristas e viagens.
        </p>
        <button
          onClick={onUpgrade}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90"
        >
          Escolher um plano
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    );
  }

  const planName = (plan?.name ?? "Plano").toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-4 text-white">
      {/* Badge */}
      <div className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold tracking-[0.5px] text-white">
        <Zap className="h-2.5 w-2.5 fill-white" strokeWidth={0} />
        PLANO {planName}
      </div>

      {/* Mensalidade */}
      <div className="mt-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.3px] text-white/60">
          Mensalidade
        </div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <div className="font-mono text-[32px] font-extrabold leading-none tracking-[-1px]">
            {formatPrice(plan?.price ?? 0)}
          </div>
          <div className="text-[12px] text-white/60">/mês</div>
        </div>
        <div className="mt-1 text-[11px] text-white/55">
          Válido até {formatDateTime(subscription.expiresAt)}
        </div>
      </div>

      {/* Usage bars */}
      {usage ? (
        <div className="mt-3.5 flex flex-col gap-2.5">
          <PlanUsageLine
            icon={Car}
            label="Veículos"
            used={usage.vehicles.used}
            max={usage.vehicles.max}
          />
          <PlanUsageLine
            icon={Users}
            label="Motoristas"
            used={usage.drivers.used}
            max={usage.drivers.max}
          />
          <PlanUsageLine
            icon={Bus}
            label="Viagens / mês"
            used={usage.monthlyTrips.used}
            max={usage.monthlyTrips.max}
          />
        </div>
      ) : usage === undefined ? (
        <div className="mt-3.5 h-12 animate-pulse rounded-md bg-white/10" />
      ) : null}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onUpgrade}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90"
        >
          Fazer upgrade
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
        <Link
          to="/subscription"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.18] bg-transparent px-3.5 py-2.5 text-[13px] font-bold text-white transition hover:bg-white/10"
        >
          <CreditCard className="h-3.5 w-3.5" strokeWidth={1.8} />
          Assinatura
        </Link>
      </div>
    </div>
  );
}

function PlanUsageLine({
  icon: Icon,
  label,
  used,
  max,
}: {
  icon: LucideIcon;
  label: string;
  used: number;
  max: number;
}) {
  const unlimited = isUnlimitedPlanLimit(max);
  if (unlimited) {
    return (
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-white/70" strokeWidth={1.7} />
          <span className="font-semibold !text-white/85">{label}</span>
        </div>
        <span className="font-mono text-[11px] font-bold !text-white">
          {used} <span className="!text-white/50">(ilimitado)</span>
        </span>
      </div>
    );
  }
  const pct = max > 0 ? Math.min(100, Math.max(0, (used / max) * 100)) : 0;
  const full = pct >= 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold">
          <Icon
            className={cn("h-3.5 w-3.5", full ? "text-accent" : "text-white/70")}
            strokeWidth={1.7}
          />
          <span className="!text-white/85">{label}</span>
        </div>
        <div
          className={cn("font-mono text-[11px] font-bold", full ? "!text-accent" : "!text-white")}
        >
          {used}
          <span className="!text-white/50">/{max}</span>
        </div>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            full ? "bg-accent" : "bg-white/60",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Upgrade dialog ───────────────────────────────────────────────────────────

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
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        title="Escolher um plano"
        footer={
          <button
            type="button"
            disabled={!selectedId || submitting || noChange}
            onClick={handleConfirm}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-extrabold tracking-[-0.2px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Confirmando..." : noChange ? "Plano atual" : "Confirmar plano"}
          </button>
        }
      >
        {plans === null ? (
          <LoadingList count={3} height="h-20" />
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface-2 p-4 text-center text-[13px] text-muted-foreground">
            Nenhum plano disponível.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {plans.map((p) => {
              const isCurrent = p.id === currentPlanId;
              const selected = p.id === selectedId;
              const unlimited = isUnlimitedPlanLimit(p.maxMonthlyTrips);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    selected
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:bg-surface-2",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-[1.8px] transition-colors",
                      selected
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-transparent text-transparent",
                    )}
                  >
                    <Check className="h-[11px] w-[11px]" strokeWidth={3} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">
                        {p.name}
                      </span>
                      {isCurrent && (
                        <span className="flex-none rounded-full bg-line-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.3px] text-muted-foreground">
                          ATUAL
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-1">
                      <span className="font-mono text-[15px] font-extrabold tracking-[-0.5px] text-ink">
                        {formatPrice(p.price)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">/mês</span>
                    </div>
                    <div className="mt-1.5 text-[11px] leading-[1.5] text-ink-2">
                      {p.maxVehicles} veículos · {p.maxDrivers} motoristas ·{" "}
                      {unlimited ? "viagens ilimitadas/mês" : `${p.maxMonthlyTrips} viagens/mês`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
