import { createFileRoute, Outlet } from "@tanstack/react-router";

// Antes esse layout fazia hard redirect pra /login se !isAuthenticated. Agora deixa o
// Outlet renderizar sempre e cada rota filha decide se mostra <LoginRequired /> inline
// (mantendo AppShell + BottomNav visíveis pra deslogado). Mantemos o nome `_protected`
// pra evitar mexer em routeTree.gen.ts e em todos os createFileRoute filhos.
export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
