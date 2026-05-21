import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/lib/handle-error";

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
      handleApiError(err, "Erro ao solicitar recuperação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-md px-6 py-10 flex flex-col">
        <div className="flex flex-col items-center text-center mb-8 mt-8">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-4">
            <Bus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Recuperar senha</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Informe seu e-mail para receber um link de recuperação
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              Se este e-mail estiver cadastrado, você receberá um link de recuperação em alguns
              minutos. Verifique também a caixa de spam.
            </div>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full h-12 text-base">
                Voltar ao login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
              {submitting ? "Enviando..." : "Enviar link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-medium">
                Voltar ao login
              </Link>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
