import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { apiErrorMessage } from "@/lib/handle-error";
import { PublicShell } from "@/components/layout/PublicShell";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().email("E-mail inválido") });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authService.forgotPassword(parsed.data.email);
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao solicitar recuperação"));
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
          <h1 className="text-[24px] font-extrabold tracking-[-0.6px] text-ink">Recuperar senha</h1>
          <p className="mt-1.5 text-balance text-[13px] text-muted-foreground">
            Informe seu e-mail para receber um link de recuperação
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-[14px] border border-line bg-surface-2 p-3.5 text-[12px] leading-[1.45] text-ink-2">
              Se este e-mail estiver cadastrado, você receberá um link de recuperação em alguns
              minutos. Verifique também a caixa de spam.
            </div>
            <Link
              to="/login"
              className="h-12 w-full rounded-[12px] border border-line bg-surface text-center text-[14px] font-bold leading-[3rem] text-ink hover:bg-line-soft"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div>
              <Label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-bold tracking-[0.1px] text-ink-2"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="mt-1 text-[11px] font-semibold text-danger">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="mt-1.5 h-12 w-full rounded-[12px] bg-ink text-[14px] font-bold text-surface hover:bg-ink/90"
            >
              {submitting ? "Enviando..." : "Enviar link"}
            </Button>
            <p className="text-center text-[13px] text-muted-foreground">
              <Link to="/login" className="font-bold text-ink hover:underline">
                Voltar ao login
              </Link>
            </p>
          </form>
        )}
      </div>
    </PublicShell>
  );
}
