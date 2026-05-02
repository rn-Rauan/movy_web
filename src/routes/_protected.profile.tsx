import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Mail, User as UserIcon, LogOut, Phone, Lock } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

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
  const { user, logout, refreshUser } = useAuth();

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
      telephone: "",
    });
    setFormErrors({});
    setEditOpen(true);
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { errs[e.path.join(".")] = e.message; });
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
      parsed.error.errors.forEach((e) => { errs[e.path.join(".")] = e.message; });
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
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{user?.name ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{user?.email ?? "—"}</div>
          </div>
          <Button size="sm" variant="outline" onClick={openEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3 text-sm border-t border-border pt-4">
          <Field icon={<UserIcon className="h-4 w-4" />} label="Nome" value={user?.name} />
          <Field icon={<Mail className="h-4 w-4" />} label="E-mail" value={user?.email} />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Conta</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              setPwForm({ password: "", confirm: "" });
              setPwErrors({});
              setPwOpen(true);
            }}
          >
            <Lock className="h-4 w-4 mr-2" />
            Alterar senha
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </Card>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-3 mt-2">
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
          <form onSubmit={handlePasswordSubmit} className="space-y-3 mt-2">
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
