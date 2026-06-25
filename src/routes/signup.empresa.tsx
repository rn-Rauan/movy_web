import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Building2 } from "lucide-react";
import { api, tokenStorage, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { apiErrorMessage, zodFieldErrors } from "@/lib/handle-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/feedback/FormError";
import { PublicShell } from "@/components/layout/PublicShell";
import { SignupAudienceToggle } from "@/components/passenger/SignupAudienceToggle";
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
    .replace(/[̀-ͯ]/g, "")
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
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setFormError(null);
    setFieldErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  }

  function onOrgNameChange(v: string) {
    setForm((f) => ({
      ...f,
      organizationName: v,
      slug: slugTouched ? f.slug : slugify(v),
    }));
    setFormError(null);
    setFieldErrors((e) => (e.organizationName ? { ...e, organizationName: "" } : e));
  }

  function onSlugChange(v: string) {
    setSlugTouched(true);
    update("slug", sanitizeSlug(v));
  }

  function handleConflict(err: ApiError) {
    const msg = String(
      (err.data as { message?: string } | null)?.message ?? err.message ?? "",
    ).toLowerCase();
    if (msg.includes("slug")) {
      setFieldErrors({ slug: "Esse slug já está em uso, escolha outro." });
    } else if (msg.includes("email") || msg.includes("e-mail") || msg.includes("user")) {
      setFieldErrors({ userEmail: "Já existe uma conta com esse e-mail." });
    } else {
      setFormError("E-mail ou slug já cadastrado.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
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
        handleConflict(err);
      } else {
        setFormError(apiErrorMessage(err, "Falha ao cadastrar empresa"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicShell showEntrar={false}>
      <div className="mx-auto max-w-sm pt-7 pb-6">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-ink">
            <Building2 className="h-[26px] w-[26px] text-surface" strokeWidth={1.8} />
          </span>
          <h1 className="text-[24px] font-extrabold tracking-[-0.6px] text-ink">
            Cadastrar empresa
          </h1>
          <p className="mt-1.5 text-balance text-[13px] text-muted-foreground">
            Gerencie frota, motoristas e cobre passageiros em um só lugar.
          </p>
        </div>

        <SignupAudienceToggle current="company" />

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormError>{formError}</FormError>
          <section className="flex flex-col gap-3">
            <SectionLabel>Responsável</SectionLabel>
            <FieldGroup label="Nome completo" htmlFor="userName" error={fieldErrors.userName}>
              <Input
                id="userName"
                value={form.userName}
                onChange={(e) => update("userName", e.target.value)}
                autoComplete="name"
                required
              />
            </FieldGroup>
            <FieldGroup label="E-mail" htmlFor="userEmail" error={fieldErrors.userEmail}>
              <Input
                id="userEmail"
                type="email"
                inputMode="email"
                value={form.userEmail}
                onChange={(e) => update("userEmail", e.target.value)}
                autoComplete="email"
                required
              />
            </FieldGroup>
            <FieldGroup label="Telefone" htmlFor="userTelephone" error={fieldErrors.userTelephone}>
              <Input
                id="userTelephone"
                type="tel"
                inputMode="tel"
                value={form.userTelephone}
                onChange={(e) => update("userTelephone", e.target.value)}
                autoComplete="tel"
                required
              />
            </FieldGroup>
            <FieldGroup
              label="Senha"
              htmlFor="userPassword"
              hint="Mínimo 8 caracteres"
              error={fieldErrors.userPassword}
            >
              <Input
                id="userPassword"
                type="password"
                value={form.userPassword}
                onChange={(e) => update("userPassword", e.target.value)}
                autoComplete="new-password"
                required
              />
            </FieldGroup>
          </section>

          <section className="flex flex-col gap-3">
            <SectionLabel>Empresa</SectionLabel>
            <FieldGroup
              label="Nome da empresa"
              htmlFor="organizationName"
              error={fieldErrors.organizationName}
            >
              <Input
                id="organizationName"
                value={form.organizationName}
                onChange={(e) => onOrgNameChange(e.target.value)}
                required
              />
            </FieldGroup>
            <FieldGroup label="CNPJ" htmlFor="cnpj" error={fieldErrors.cnpj}>
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => update("cnpj", e.target.value)}
                required
              />
            </FieldGroup>
            <FieldGroup
              label="E-mail comercial"
              htmlFor="organizationEmail"
              error={fieldErrors.organizationEmail}
            >
              <Input
                id="organizationEmail"
                type="email"
                inputMode="email"
                value={form.organizationEmail}
                onChange={(e) => update("organizationEmail", e.target.value)}
                required
              />
            </FieldGroup>
            <FieldGroup
              label="Telefone comercial"
              htmlFor="organizationTelephone"
              error={fieldErrors.organizationTelephone}
            >
              <Input
                id="organizationTelephone"
                type="tel"
                inputMode="tel"
                value={form.organizationTelephone}
                onChange={(e) => update("organizationTelephone", e.target.value)}
                required
              />
            </FieldGroup>
            <FieldGroup label="Endereço" htmlFor="address" error={fieldErrors.address}>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                required
              />
            </FieldGroup>
            <FieldGroup
              label="Slug (URL pública)"
              htmlFor="slug"
              hint={`Sua URL: /public/organizations/${form.slug || "minha-empresa"}`}
              error={fieldErrors.slug}
            >
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="minha-empresa"
                required
              />
            </FieldGroup>
          </section>

          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-[12px] bg-ink text-[14px] font-bold text-surface hover:bg-ink/90"
          >
            {submitting ? "Cadastrando..." : "Cadastrar empresa"}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-bold text-ink hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
      {children}
    </h2>
  );
}

function FieldGroup({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[11px] font-bold tracking-[0.1px] text-ink-2"
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] font-semibold text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 pl-0.5 text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
