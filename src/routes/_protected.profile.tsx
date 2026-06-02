import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  Pencil,
  Mail,
  User as UserIcon,
  LogOut,
  Lock,
  IdCard,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginRequired } from "@/components/feedback/LoginRequired";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  telephone: z.string().trim().optional(),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

function ProfilePage() {
  const location = useLocation();
  if (location.pathname !== "/profile") {
    return <Outlet />;
  }
  return <ProfileIndex />;
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function ProfileIndex() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <AppShell title="Perfil">
        <LoginRequired message="Entre na sua conta para ver e editar seu perfil." />
      </AppShell>
    );
  }
  return <ProfileIndexContent />;
}

function ProfileIndexContent() {
  const { user, logout, refreshUser } = useAuth();
  const { hasDriverProfile, isDriver } = useRole();

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", telephone: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [pwForm, setPwForm] = useState({ password: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSubmitting, setPwSubmitting] = useState(false);

  function openEdit() {
    setForm({
      name: user?.name ?? "",
      email: user?.email ?? "",
      telephone: user?.telephone ?? "",
    });
    setFormErrors({});
    setEditOpen(true);
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errs[e.path.join(".")] = e.message;
      });
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    try {
      await api("/users/me", {
        method: "PUT",
        body: JSON.stringify(parsed.data),
      });
      await refreshUser();
      toast.success("Perfil atualizado");
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar perfil");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(pwForm);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errs[e.path.join(".")] = e.message;
      });
      setPwErrors(errs);
      return;
    }
    setPwErrors({});
    setPwSubmitting(true);
    try {
      await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({ password: parsed.data.password }),
      });
      toast.success("Senha alterada");
      setPwOpen(false);
      setPwForm({ password: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setPwSubmitting(false);
    }
  }

  return (
    <AppShell title="Perfil">
      <div className="flex flex-col gap-3.5">
        {/* Hero card com avatar */}
        <div className="relative overflow-hidden rounded-[18px] border border-line bg-surface p-[18px] text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(60% 70% at 50% 0%, var(--accent-soft) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <div
              className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ink text-[26px] font-extrabold tracking-[-0.5px] text-white"
              style={{
                border: "3px solid var(--surface)",
                boxShadow: "0 4px 16px var(--accent-soft)",
              }}
            >
              {initials(user?.name)}
            </div>
            <div className="text-[20px] font-extrabold tracking-[-0.5px] text-ink">
              {user?.name ?? "—"}
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-muted-foreground">
              {user?.email ?? "—"}
            </div>
            <div className="mt-3.5 flex justify-center">
              <button
                onClick={openEdit}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-bold text-white transition hover:opacity-90"
              >
                <Pencil className="h-3 w-3" strokeWidth={2} />
                Editar perfil
              </button>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <InfoRow icon={UserIcon} label="Nome" value={user?.name} />
          <InfoRow icon={Mail} label="E-mail" value={user?.email} last />
        </div>

        {/* Driver section */}
        <DriverProfileCard hasDriverProfile={hasDriverProfile} isDriver={isDriver} />

        {/* Conta */}
        <div>
          <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
            Conta
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <ActionRow
              icon={Lock}
              label="Alterar senha"
              hint="Mantenha sua conta segura"
              onClick={() => {
                setPwForm({ password: "", confirm: "" });
                setPwErrors({});
                setPwOpen(true);
              }}
              last
            />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 rounded-2xl border border-danger-soft bg-surface px-4 py-3.5 text-[13px] font-bold text-danger transition hover:bg-danger-soft"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Sair da conta
        </button>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="mt-2 space-y-3">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input
                value={form.telephone}
                onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="mt-2 space-y-3">
            <div className="space-y-1">
              <Label>Nova senha</Label>
              <Input
                type="password"
                value={pwForm.password}
                onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 8 caracteres"
              />
              {pwErrors.password && <p className="text-xs text-destructive">{pwErrors.password}</p>}
            </div>
            <div className="space-y-1">
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              />
              {pwErrors.confirm && <p className="text-xs text-destructive">{pwErrors.confirm}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={pwSubmitting}>
              {pwSubmitting ? "Salvando..." : "Alterar senha"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  last,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-3", !last && "border-b border-line-soft")}>
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-surface-2 text-ink-2">
        <Icon className="h-[15px] w-[15px]" strokeWidth={1.7} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2px] text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 truncate text-[14px] font-semibold text-ink">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  hint,
  last,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  last?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-surface-2",
        !last && "border-b border-line-soft",
      )}
    >
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-surface-2 text-ink-2">
        <Icon className="h-[15px] w-[15px]" strokeWidth={1.7} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-ink">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <ChevronRight className="h-4 w-4 flex-none text-muted-foreground" strokeWidth={1.8} />
    </button>
  );
}

function DriverProfileCard({
  hasDriverProfile,
  isDriver,
}: {
  hasDriverProfile: boolean;
  isDriver: boolean;
}) {
  if (!hasDriverProfile) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-accent-soft p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-accent text-white">
            <IdCard className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">
              Trabalhar como motorista
            </div>
            <div className="mt-1 text-[12px] leading-snug text-ink-2">
              Apenas para motoristas que vão trabalhar para uma empresa cadastrada no sistema.
            </div>
          </div>
        </div>
        <Link
          to="/profile/driver"
          className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-ink px-3 py-3 text-[13px] font-bold text-white transition hover:opacity-90"
        >
          Ativar perfil de motorista
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    );
  }

  if (!isDriver) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-warning-soft text-warning">
            <IdCard className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">
              Perfil de motorista
            </div>
            <div className="mt-1 text-[12px] leading-snug text-ink-2">
              Aguardando vínculo com uma empresa. Funcionalidades de motorista ficam disponíveis
              após um admin te vincular à organização dele.
            </div>
          </div>
        </div>
        <Link
          to="/profile/driver"
          className="mt-3.5 inline-flex w-full items-center justify-center rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-[13px] font-bold text-ink transition hover:bg-line-soft"
        >
          Ver dados
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-success-soft text-success">
          <IdCard className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">
            Perfil de motorista
          </div>
          <div className="mt-1 text-[12px] text-ink-2">Ativo no sistema</div>
        </div>
      </div>
      <Link
        to="/profile/driver"
        className="mt-3.5 inline-flex w-full items-center justify-center rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-[13px] font-bold text-ink transition hover:bg-line-soft"
      >
        Editar dados
      </Link>
    </div>
  );
}
