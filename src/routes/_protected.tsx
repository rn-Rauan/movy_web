import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

// Mantém a estrutura de rotas protegidas e aplica a regra centralizada:
// usuários autenticados sem e-mail confirmado só podem acessar a rota de verificação.
export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { isAuthenticated, isEmailVerified, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Outlet />;
  if (!isEmailVerified) return <Navigate to="/verify-email" replace />;

  return <Outlet />;
}
