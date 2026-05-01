import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/public/trip-instances")({
  component: () => <Outlet />,
});
