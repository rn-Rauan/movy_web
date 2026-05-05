import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { api, tokenStorage, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthUser } from "@/lib/types";

export const Route = createFileRoute("/signup/empresa")({
  component: SignupEmpresaPage,
});

const schema = z.object({
  userName: z.string().trim().min(2, "Informe seu nome"),
  userEmail: z.string().email("E-mail inválido"),
  userTelephone: z.string().trim().min(8, "Telefone inválido"),
  userPassword: z.string().min(8, "Mínimo 8 caracteres"),
  organizationName: z.string().trim().min(2, "Informe o nome da empresa"),
  cnpj: z.string().trim().min(14, "CNPJ deve ter ao menos 14 caracteres"),
  organizationEmail: z.string().email("E-mail comercial inválido"),
  organizationTelephone: z.string().trim().min(8, "Telefone comercial inválido"),
  address: z.string().trim().min(5, "Informe o endereço"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
});

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
}

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

function SignupEmpresaPage() {
  const { refreshUser } = useAuth();
  const { refetchRole } = useRole();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userTelephone: "",
    userPassword: "",
    organizationName: "",
    cnpj: "",
    organizationEmail: "",
    organizationTelephone: "",
    address: "",
    slug: "",
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onOrgNameChange(v: string) {
    setForm((f) => ({
      ...f,
      organizationName: v,
      slug: slugTouched ? f.slug : slugify(v),
    }));
  }

  function onSlugChange(v: string) {
    setSlugTouched(true);
    update("slug", sanitizeSlug(v));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<TokenResponse>("/auth/register-organization", {
        method: "POST",
        auth: false,
        body: JSON.stringify(parsed.data),
      });
      tokenStorage.set(res);
      refreshUser();
      await refetchRole();
      navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const msg = String(
          (err.data as { message?: string } | null)?.message ?? err.message ?? "",
        ).toLowerCase();
        if (msg.includes("slug")) {
          toast.error("Esse slug já está em uso, escolha outro");
        } else if (msg.includes("email") || msg.includes("e-mail") || msg.includes("user")) {
          toast.error("Já existe conta com esse e-mail");
        } else {
          toast.error("E-mail ou slug já cadastrado");
        }
      } else {
        toast.error(err instanceof Error ? err.message : "Falha ao cadastrar empresa");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-md px-6 py-8">
        <div className="mb-6 mt-4 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cadastre sua empresa de transporte</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie frota, motoristas, viagens e cobre passageiros em um só lugar.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Responsável
            </h2>
            <Field id="userName" label="Nome completo">
              <Input
                id="userName"
                value={form.userName}
                onChange={(e) => update("userName", e.target.value)}
                className="h-12 text-base"
                autoComplete="name"
                required
              />
            </Field>
            <Field id="userEmail" label="E-mail">
              <Input
                id="userEmail"
                type="email"
                inputMode="email"
                value={form.userEmail}
                onChange={(e) => update("userEmail", e.target.value)}
                className="h-12 text-base"
                autoComplete="email"
                required
              />
            </Field>
            <Field id="userTelephone" label="Telefone">
              <Input
                id="userTelephone"
                type="tel"
                inputMode="tel"
                value={form.userTelephone}
                onChange={(e) => update("userTelephone", e.target.value)}
                className="h-12 text-base"
                autoComplete="tel"
                required
              />
            </Field>
            <Field id="userPassword" label="Senha">
              <Input
                id="userPassword"
                type="password"
                value={form.userPassword}
                onChange={(e) => update("userPassword", e.target.value)}
                className="h-12 text-base"
                autoComplete="new-password"
                required
              />
            </Field>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Empresa
            </h2>
            <Field id="organizationName" label="Nome da empresa">
              <Input
                id="organizationName"
                value={form.organizationName}
                onChange={(e) => onOrgNameChange(e.target.value)}
                className="h-12 text-base"
                required
              />
            </Field>
            <Field id="cnpj" label="CNPJ">
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => update("cnpj", e.target.value)}
                className="h-12 text-base"
                required
              />
            </Field>
            <Field id="organizationEmail" label="E-mail comercial">
              <Input
                id="organizationEmail"
                type="email"
                inputMode="email"
                value={form.organizationEmail}
                onChange={(e) => update("organizationEmail", e.target.value)}
                className="h-12 text-base"
                required
              />
            </Field>
            <Field id="organizationTelephone" label="Telefone comercial">
              <Input
                id="organizationTelephone"
                type="tel"
                inputMode="tel"
                value={form.organizationTelephone}
                onChange={(e) => update("organizationTelephone", e.target.value)}
                className="h-12 text-base"
                required
              />
            </Field>
            <Field id="address" label="Endereço">
              <Input
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="h-12 text-base"
                required
              />
            </Field>
            <Field id="slug" label="Slug (URL pública)">
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                className="h-12 text-base"
                placeholder="minha-empresa"
                required
              />
              <p className="text-xs text-muted-foreground">
                Sua URL será /public/organizations/{form.slug || "minha-empresa"}
              </p>
            </Field>
          </section>

          <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
            {submitting ? "Cadastrando..." : "Cadastrar empresa"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary font-medium">
            Entrar
          </Link>
        </p>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}