import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
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
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-md px-6 py-8">
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-muted-foreground text-sm mt-1">Leva menos de um minuto</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field id="name" label="Nome completo">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="h-12 text-base"
              autoComplete="name"
              required
            />
          </Field>
          <Field id="email" label="E-mail">
            <Input
              id="email"
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="h-12 text-base"
              autoComplete="email"
              required
            />
          </Field>
          <Field id="telephone" label="Telefone">
            <Input
              id="telephone"
              type="tel"
              inputMode="tel"
              value={form.telephone}
              onChange={(e) => update("telephone", e.target.value)}
              className="h-12 text-base"
              autoComplete="tel"
              required
            />
          </Field>
          <Field id="password" label="Senha">
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="h-12 text-base"
              autoComplete="new-password"
              required
            />
          </Field>
          <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
            {submitting ? "Criando..." : "Criar conta"}
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

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
