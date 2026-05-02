import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, adminOrgId, roleLoading } = useRole();

  if (authLoading || (isAuthenticated && roleLoading)) return null;

  if (!isAuthenticated) return <Navigate to="/public/trip-instances" />;
  if (isAdmin && adminOrgId) return <Navigate to="/dashboard" />;
  return <Navigate to="/public/trip-instances" />;
}
