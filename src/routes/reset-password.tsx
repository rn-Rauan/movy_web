import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/lib/auth-context";
import { handleApiError } from "@/lib/handle-error";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
});

const schema = z
  .object({
    newPassword: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem",
  });

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const missingToken = !token;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ newPassword, confirm });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path.join(".")] = i.message;
      });
      setErrors(errs);
      return;
    }
    if (!token) return;
    setErrors({});
    setSubmitting(true);
    try {
      const res = await authService.resetPassword(token, parsed.data.newPassword);
      setSession(res);
      toast.success("Senha redefinida com sucesso");
      navigate({ to: "/" });
    } catch (err) {
      handleApiError(err, "Erro ao redefinir senha");
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
          <h1 className="text-2xl font-bold">Nova senha</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Escolha uma nova senha para sua conta
          </p>
        </div>

        {missingToken ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              Link de recuperação inválido. Solicite um novo.
            </div>
            <Link to="/forgot-password" className="block">
              <Button className="w-full h-12 text-base">Solicitar novo link</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 text-base"
                required
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 text-base"
                required
              />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
              {submitting ? "Salvando..." : "Redefinir senha"}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
