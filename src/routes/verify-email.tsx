import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Bus, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/lib/auth-context";
import { tokenStorage } from "@/lib/api";

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
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-md px-6 py-10 flex flex-col">
        <div className="flex flex-col items-center text-center mb-8 mt-8">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-4">
            <Bus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Verificar e-mail</h1>
        </div>

        {state === "pending" && (
          <p className="text-center text-sm text-muted-foreground">Verificando seu e-mail...</p>
        )}

        {state === "success" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm">E-mail verificado com sucesso. Redirecionando...</span>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <span className="text-sm">{errorMessage}</span>
            </div>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full h-12 text-base">
                Voltar ao login
              </Button>
            </Link>
          </div>
        )}

        {state === "missing" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              Link de verificação inválido.
            </div>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full h-12 text-base">
                Voltar ao login
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
