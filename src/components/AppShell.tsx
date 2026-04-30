import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Ticket, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  back?: boolean;
  children: React.ReactNode;
  showTabs?: boolean;
};

export function AppShell({ title, back, children, showTabs = true }: Props) {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="mx-auto max-w-md flex items-center gap-2 px-4 h-14">
          {back ? (
            <button
              onClick={() => router.history.back()}
              aria-label="Voltar"
              className="p-2 -ml-2 rounded-lg hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <h1 className="text-lg font-semibold flex-1 truncate">{title}</h1>
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-md px-4 py-4 pb-24">
        {children}
      </main>
      {isAuthenticated && showTabs ? (
        <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border">
          <div className="mx-auto max-w-md grid grid-cols-2">
            <TabLink to="/organizations" icon={<MapPin className="h-5 w-5" />} label="Viagens" active={path.startsWith("/organizations") || path.startsWith("/trips")} />
            <TabLink to="/my-bookings" icon={<Ticket className="h-5 w-5" />} label="Inscrições" active={path.startsWith("/my-bookings")} />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function TabLink({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}