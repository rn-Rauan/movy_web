import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Bus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicShell } from "@/components/layout/PublicShell";
import { SignupAudienceToggle } from "@/components/passenger/SignupAudienceToggle";

export const Route = createFileRoute("/signup/")({
  component: SignupPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  telephone: z.string().min(8, "Telefone inválido"),
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    telephone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
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
      await signup(parsed.data);
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cadastrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicShell showEntrar={false}>
      <div className="mx-auto max-w-sm pt-7 pb-6">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-ink">
            <Bus className="h-[26px] w-[26px] text-surface" strokeWidth={1.8} />
          </span>
          <h1 className="text-[24px] font-extrabold tracking-[-0.6px] text-ink">Criar conta</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">Leva menos de um minuto</p>
        </div>

        <SignupAudienceToggle current="passenger" />

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <FieldGroup label="Nome completo" htmlFor="name">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              autoComplete="name"
              required
            />
          </FieldGroup>
          <FieldGroup label="E-mail" htmlFor="email">
            <Input
              id="email"
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              required
            />
          </FieldGroup>
          <FieldGroup label="Telefone" htmlFor="telephone">
            <Input
              id="telephone"
              type="tel"
              inputMode="tel"
              value={form.telephone}
              onChange={(e) => update("telephone", e.target.value)}
              autoComplete="tel"
              required
            />
          </FieldGroup>
          <FieldGroup label="Senha" htmlFor="password" hint="Mínimo 8 caracteres">
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="new-password"
              required
            />
          </FieldGroup>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-1.5 h-12 w-full rounded-[12px] bg-ink text-[14px] font-bold text-surface hover:bg-ink/90"
          >
            {submitting ? "Criando..." : "Criar conta"}
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

function FieldGroup({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
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
      {hint && <p className="mt-1 pl-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
