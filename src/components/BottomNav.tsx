import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Building2, Ticket, Settings2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type NavItem = {
  to: string;
  icon: React.ReactNode;
  label: string;
  match: string | string[];
};

// ─── Phase 1: todas as telas visíveis para todos ──────────────────────────────
const allTabs: NavItem[] = [
  {
    to: "/public/trip-instances",
    icon: <Compass className="h-5 w-5" />,
    label: "Explorar",
    match: "/public",
  },
  {
    to: "/organizations",
    icon: <Building2 className="h-5 w-5" />,
    label: "Empresas",
    match: ["/organizations", "/trips"],
  },
  {
    to: "/my-bookings",
    icon: <Ticket className="h-5 w-5" />,
    label: "Inscrições",
    match: "/my-bookings",
  },
  {
    to: "/setup",
    icon: <Settings2 className="h-5 w-5" />,
    label: "Admin",
    match: "/setup",
  },
];

// ─── Phase 2 (descomentar quando as rotas existirem) ─────────────────────────
//
// import { CalendarDays, Users, LayoutDashboard, Cog, User } from "lucide-react";
//
// const passengerTabs: NavItem[] = [
//   { to: "/public/trip-instances", icon: <Compass />, label: "Explorar", match: "/public" },
//   { to: "/organizations",         icon: <Building2 />, label: "Empresas", match: ["/organizations", "/trips"] },
//   { to: "/my-bookings",           icon: <Ticket />,    label: "Inscrições", match: "/my-bookings" },
//   { to: "/profile",               icon: <User />,      label: "Perfil",    match: "/profile" },
// ];
//
// const driverTabs: NavItem[] = [
//   { to: "/driver/trips",      icon: <CalendarDays />, label: "Viagens",    match: "/driver/trips" },
//   { to: "/driver/passengers", icon: <Users />,        label: "Passageiros",match: "/driver/passengers" },
//   { to: "/my-bookings",       icon: <Ticket />,       label: "Inscrições", match: "/my-bookings" },
//   { to: "/profile",           icon: <User />,         label: "Perfil",     match: "/profile" },
// ];
//
// function adminTabs(orgId: string): NavItem[] {
//   return [
//     { to: `/admin/dashboard`,    icon: <LayoutDashboard />, label: "Painel",   match: "/admin/dashboard" },
//     { to: `/trips/${orgId}`,     icon: <Building2 />,       label: "Viagens",  match: "/trips" },
//     { to: `/admin/team`,         icon: <Users />,           label: "Equipe",   match: "/admin/team" },
//     { to: `/admin/settings`,     icon: <Cog />,             label: "Empresa",  match: "/admin/settings" },
//   ];
// }
//
// Lógica de seleção (dentro do componente, após importar useRole):
//
// const { isAdmin, isDriver, adminOrgId } = useRole();
// const tabs = isAdmin && adminOrgId
//   ? adminTabs(adminOrgId)
//   : isDriver
//   ? driverTabs
//   : passengerTabs;

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-20">
      <div className="mx-auto max-w-md grid grid-cols-4">
        {allTabs.map((tab) => {
          const active = Array.isArray(tab.match)
            ? tab.match.some((m) => path.startsWith(m))
            : path.startsWith(tab.match);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
