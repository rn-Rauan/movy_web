import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Bus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { loginErrorMessage, zodFieldErrors } from "@/lib/handle-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/feedback/FormError";
import { PublicShell } from "@/components/layout/PublicShell";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      navigate({ to: redirect ? (redirect as string) : "/" });
    } catch (err) {
      setFormError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicShell showEntrar={false}>
      <div className="mx-auto max-w-sm pt-10 pb-6">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-ink">
            <Bus className="h-[26px] w-[26px] text-surface" strokeWidth={1.8} />
          </span>
          <h1 className="text-[26px] font-extrabold tracking-[-0.8px] text-ink">Entrar</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Acesse sua conta para reservar viagens
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <FormError>{formError}</FormError>
          <FieldGroup label="E-mail" htmlFor="email" error={fieldErrors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormError(null);
              }}
              required
            />
          </FieldGroup>
          <FieldGroup
            label="Senha"
            htmlFor="password"
            error={fieldErrors.password}
            rightLink={
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-accent hover:underline"
              >
                Esqueci
              </Link>
            }
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError(null);
              }}
              required
            />
          </FieldGroup>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-1.5 h-12 w-full rounded-[12px] bg-ink text-[14px] font-bold text-surface hover:bg-ink/90"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/signup" className="font-bold text-ink hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}

function FieldGroup({
  label,
  htmlFor,
  rightLink,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  rightLink?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-[11px] font-bold tracking-[0.1px] text-ink-2">
          {label}
        </Label>
        {rightLink}
      </div>
      {children}
      {error && <p className="mt-1 text-[11px] font-semibold text-danger">{error}</p>}
    </div>
  );
}
