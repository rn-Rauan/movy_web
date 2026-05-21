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
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  params?: Record<string, string>;
  icon: LucideIcon;
  label: string;
  match: string | string[];
};

const passengerTabs: NavItem[] = [
  { to: "/public/trip-instances", icon: Compass, label: "Explorar", match: "/public" },
  {
    to: "/organizations",
    icon: Building2,
    label: "Empresas",
    match: ["/organizations", "/trips"],
  },
  { to: "/my-bookings", icon: Ticket, label: "Inscrições", match: "/my-bookings" },
  { to: "/profile", icon: User, label: "Perfil", match: "/profile" },
];

function adminTabs(): NavItem[] {
  return [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", match: "/dashboard" },
    { to: "/trips", icon: Bus, label: "Viagens", match: "/trips" },
    { to: "/templates", icon: FileText, label: "Templates", match: "/templates" },
    { to: "/organization", icon: Building2, label: "Empresa", match: "/organization" },
    { to: "/profile", icon: User, label: "Perfil", match: "/profile" },
  ];
}

const driverTabs: NavItem[] = [
  { to: "/public/trip-instances", icon: Compass, label: "Explorar", match: "/public" },
  { to: "/my-trips", icon: Truck, label: "Como motorista", match: "/my-trips" },
  { to: "/my-bookings", icon: Ticket, label: "Inscrições", match: "/my-bookings" },
  { to: "/profile", icon: User, label: "Perfil", match: "/profile" },
];

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isDriver, adminOrgId, roleLoading } = useRole();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!isAuthenticated || roleLoading) return null;

  const tabs = isAdmin && adminOrgId ? adminTabs() : isDriver ? driverTabs : passengerTabs;

  const colsClass =
    tabs.length === 5 ? "grid-cols-5" : tabs.length === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[max(env(safe-area-inset-bottom),0px)]">
      <div className={cn("mx-auto grid max-w-2xl gap-0.5 px-1.5 pt-2 pb-2.5", colsClass)}>
        {tabs.map((tab) => {
          const active = Array.isArray(tab.match)
            ? tab.match.some((m) => path.startsWith(m))
            : path.startsWith(tab.match);

          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to as string}
              params={tab.params as Record<string, string>}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-1 text-[10.5px] font-semibold transition-colors",
                active ? "text-accent" : "text-muted-foreground hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  active && "bg-accent-soft text-accent",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.7} />
              </span>
              <span className="leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
