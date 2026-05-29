import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Bus, CheckCircle2, XCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/lib/auth-context";
import { tokenStorage } from "@/lib/api";
import { PublicShell } from "@/components/layout/PublicShell";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/verify-email")({
  validateSearch: searchSchema,
  component: VerifyEmailPage,
});

type State = "pending" | "success" | "error" | "missing";

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);
  const [state, setState] = useState<State>(token ? "pending" : "missing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;
    (async () => {
      try {
        await authService.verifyEmail(token);
        const refresh = tokenStorage.refresh;
        if (refresh) {
          try {
            const fresh = await authService.refresh(refresh);
            setSession(fresh);
          } catch {
            // Refresh falhou (sessão expirada). Verificação foi aceita — só não atualiza o JWT local.
          }
        }
        setState("success");
        toast.success("E-mail verificado!");
        setTimeout(() => navigate({ to: "/" }), 1500);
      } catch (err) {
        const code = (err as { errorCode?: string })?.errorCode;
        setErrorMessage(
          code === "INVALID_OR_EXPIRED_VERIFICATION_TOKEN_BAD_REQUEST"
            ? "Link de verificação expirou ou já foi usado."
            : err instanceof Error
              ? err.message
              : "Não foi possível verificar o e-mail.",
        );
        setState("error");
      }
    })();
  }, [token, setSession, navigate]);

  return (
    <PublicShell showEntrar={false}>
      <div className="mx-auto max-w-sm pt-10 pb-6">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-ink">
            <Bus className="h-[26px] w-[26px] text-surface" strokeWidth={1.8} />
          </span>
          <h1 className="text-[24px] font-extrabold tracking-[-0.6px] text-ink">
            Verificar e-mail
          </h1>
        </div>

        {state === "pending" && (
          <p className="text-center text-[13px] text-muted-foreground">Verificando seu e-mail...</p>
        )}

        {state === "success" && (
          <div className="flex items-center gap-3 rounded-[14px] border border-success-soft bg-success-soft p-3.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" strokeWidth={1.8} />
            <span className="text-[12px] font-semibold text-success">
              E-mail verificado com sucesso. Redirecionando...
            </span>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-[14px] border border-danger-soft bg-danger-soft p-3.5">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" strokeWidth={1.8} />
              <span className="text-[12px] font-semibold text-danger">{errorMessage}</span>
            </div>
            <Link
              to="/login"
              className="h-12 w-full rounded-[12px] border border-line bg-surface text-center text-[14px] font-bold leading-[3rem] text-ink hover:bg-line-soft"
            >
              Voltar ao login
            </Link>
          </div>
        )}

        {state === "missing" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-[14px] border border-danger-soft bg-danger-soft p-3.5 text-[12px] font-semibold text-danger">
              Link de verificação inválido.
            </div>
            <Link
              to="/login"
              className="h-12 w-full rounded-[12px] border border-line bg-surface text-center text-[14px] font-bold leading-[3rem] text-ink hover:bg-line-soft"
            >
              Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
