import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRole } from "@/lib/role-context";
import { LoadingList } from "@/components/feedback/LoadingList";

export const Route = createFileRoute("/_protected/_driver")({
  component: DriverLayout,
});

function DriverLayout() {
  const { isDriver, roleLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isDriver) {
      navigate({ to: "/", replace: true });
    }
  }, [roleLoading, isDriver, navigate]);

  if (roleLoading) {
    return (
      <div className="p-4">
        <LoadingList />
      </div>
    );
  }
  if (!isDriver) return null;
  return <Outlet />;
}
