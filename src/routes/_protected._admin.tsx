import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRole } from "@/lib/role-context";
import { LoadingList } from "@/components/feedback/LoadingList";

export const Route = createFileRoute("/_protected/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, roleLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate({ to: "/", replace: true });
    }
  }, [roleLoading, isAdmin, navigate]);

  if (roleLoading) {
    return (
      <div className="p-4">
        <LoadingList />
      </div>
    );
  }
  if (!isAdmin) return null;
  return <Outlet />;
}
