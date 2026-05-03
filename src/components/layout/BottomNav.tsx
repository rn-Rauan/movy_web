import { Link, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Building2,
  Ticket,
  Truck,
  LayoutDashboard,
  Bus,
  FileText,
  User,
} from "lucide-react";
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
    to: "/profile",
    icon: <User className="h-5 w-5" />,
    label: "Perfil",
    match: "/profile",
  },
];

function adminTabs(): NavItem[] {
  return [
    {
      to: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      match: "/dashboard",
    },
    {
      to: "/trips",
      icon: <Bus className="h-5 w-5" />,
      label: "Viagens",
      match: "/trips",
    },
    {
      to: "/templates",
      icon: <FileText className="h-5 w-5" />,
      label: "Templates",
      match: "/templates",
    },
    {
      to: "/organization",
      icon: <Building2 className="h-5 w-5" />,
      label: "Empresa",
      match: "/organization",
    },
    {
      to: "/profile",
      icon: <User className="h-5 w-5" />,
      label: "Perfil",
      match: "/profile",
    },
  ];
}

const driverTabs: NavItem[] = [
  {
    to: "/public/trip-instances",
    icon: <Compass className="h-5 w-5" />,
    label: "Explorar",
    match: "/public",
  },
  {
    to: "/my-trips",
    icon: <Truck className="h-5 w-5" />,
    label: "Como motorista",
    match: "/my-trips",
  },
  {
    to: "/my-bookings",
    icon: <Ticket className="h-5 w-5" />,
    label: "Inscrições",
    match: "/my-bookings",
  },
];

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isDriver, adminOrgId, roleLoading } = useRole();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!isAuthenticated || roleLoading) return null;

  const tabs =
    isAdmin && adminOrgId
      ? adminTabs()
      : isDriver
        ? driverTabs
        : passengerTabs;

  const colsClass =
    tabs.length === 5 ? "grid-cols-5" : tabs.length === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-20">
      <div className={`mx-auto max-w-2xl grid ${colsClass}`}>
        {tabs.map((tab) => {
          const active = Array.isArray(tab.match)
            ? tab.match.some((m) => path.startsWith(m))
            : path.startsWith(tab.match);

          return (
            <Link
              key={tab.to}
              to={tab.to as any}
              params={tab.params as any}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
