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
import { apiErrorMessage, zodFieldErrors } from "@/lib/handle-error";
import { FormError } from "@/components/feedback/FormError";
import { PublicShell } from "@/components/layout/PublicShell";

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
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const missingToken = !token;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse({ newPassword, confirm });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
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
      setFormError(apiErrorMessage(err, "Erro ao redefinir senha"));
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
          <h1 className="text-[24px] font-extrabold tracking-[-0.6px] text-ink">Nova senha</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Escolha uma nova senha para sua conta
          </p>
        </div>

        {missingToken ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-[14px] border border-danger-soft bg-danger-soft p-3.5 text-[12px] leading-[1.45] text-danger">
              Link de recuperação inválido. Solicite um novo.
            </div>
            <Link
              to="/forgot-password"
              className="h-12 w-full rounded-[12px] bg-ink text-center text-[14px] font-bold leading-[3rem] text-surface hover:bg-ink/90"
            >
              Solicitar novo link
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <FormError>{formError}</FormError>
            <FieldGroup label="Nova senha" htmlFor="newPassword" error={errors.newPassword}>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </FieldGroup>
            <FieldGroup label="Confirmar senha" htmlFor="confirm" error={errors.confirm}>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </FieldGroup>
            <Button
              type="submit"
              disabled={submitting}
              className="mt-1.5 h-12 w-full rounded-[12px] bg-ink text-[14px] font-bold text-surface hover:bg-ink/90"
            >
              {submitting ? "Salvando..." : "Redefinir senha"}
            </Button>
          </form>
        )}
      </div>
    </PublicShell>
  );
}

function FieldGroup({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
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
      {error && <p className="mt-1 text-[11px] font-semibold text-danger">{error}</p>}
    </div>
  );
}
