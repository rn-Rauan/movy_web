import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ChevronRight } from "lucide-react";
import type { Organization } from "@/lib/types";

export const Route = createFileRoute("/organizations")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    api<Organization[] | { data: Organization[] }>("/organizations/active")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setOrgs(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        toast.error(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <AppShell title="Empresas">
      <p className="text-sm text-muted-foreground mb-4">
        Escolha a empresa para ver as viagens disponíveis.
      </p>
      {orgs === null && !error ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      ) : orgs && orgs.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          Nenhuma empresa ativa no momento.
        </Card>
      ) : (
        <ul className="space-y-3">
          {orgs!.map((org) => (
            <li key={org.id}>
              <Link
                to="/trips/$orgId"
                params={{ orgId: org.id }}
                search={{ slug: org.slug }}
                className="block"
              >
                <Card className="p-4 flex items-center gap-3 active:bg-accent transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{org.name}</p>
                    {org.description ? (
                      <p className="text-xs text-muted-foreground truncate">{org.description}</p>
                    ) : null}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
