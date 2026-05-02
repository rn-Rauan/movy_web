import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Building2, Ticket, Settings2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";

type NavItem = {
  to: string;
  params?: Record<string, string>;
  icon: React.ReactNode;
  label: string;
  match: string | string[];
};

const passengerTabs: NavItem[] = [
  {
    to: "/public/trip-instances",
    icon: <Compass className="h-5 w-5" />,
    label: "Explorar",
    match: "/public",
  },
  {
    to: "/_protected/organizations",
    icon: <Building2 className="h-5 w-5" />,
    label: "Empresas",
    match: ["/organizations", "/trips"],
  },
  {
    to: "/_protected/my-bookings",
    icon: <Ticket className="h-5 w-5" />,
    label: "Inscrições",
    match: "/my-bookings",
  },
];

function adminTabs(orgId: string): NavItem[] {
  return [
    {
      to: "/public/trip-instances",
      icon: <Compass className="h-5 w-5" />,
      label: "Explorar",
      match: "/public",
    },
    {
      to: "/_protected/trips/$orgId" as string,
      params: { orgId },
      icon: <Building2 className="h-5 w-5" />,
      label: "Viagens",
      match: "/trips",
    },
    {
      to: "/_protected/setup",
      icon: <Settings2 className="h-5 w-5" />,
      label: "Configurar",
      match: "/setup",
    },
  ];
}

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const { isAdmin, adminOrgId, roleLoading } = useRole();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!isAuthenticated) return null;
  if (roleLoading) return null;

  const tabs = isAdmin && adminOrgId ? adminTabs(adminOrgId) : passengerTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-20">
      <div className={`mx-auto max-w-md grid grid-cols-${tabs.length}`}>
        {tabs.map((tab) => {
          const active = Array.isArray(tab.match)
            ? tab.match.some((m) => path.startsWith(m))
            : path.startsWith(tab.match);

          return (
            <Link
              key={tab.to}
              to={tab.to as any}
              params={tab.params as any}
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
