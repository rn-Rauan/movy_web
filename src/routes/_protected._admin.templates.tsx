import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { useRole } from "@/lib/role-context";
import { api } from "@/lib/api";
import type { Paginated, TripTemplate } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/templates")({
  component: TemplatesPage,
});

const SHIFT_LABEL: Record<string, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
};

function TemplatesPage() {
  const { adminOrgId } = useRole();
  const [templates, setTemplates] = useState<TripTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminOrgId) return;
    let cancelled = false;
    api<TripTemplate[] | Paginated<TripTemplate>>(
      `/trip-templates/organization/${adminOrgId}`,
    )
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setTemplates(list);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erro ao carregar templates";
        setError(msg);
        toast.error(msg);
      });
    return () => {
      cancelled = true;
    };
  }, [adminOrgId]);

  const loading = templates === null && !error;
  const list = templates ?? [];

  return (
    <AppShell title="Templates">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "template" : "templates"}
        </p>
        <Button size="sm" disabled>
          <Plus className="h-4 w-4 mr-1" />
          Criar template
        </Button>
      </div>

      {loading ? (
        <LoadingList count={3} height="h-24" />
      ) : list.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhum template cadastrado.
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((tpl) => (
            <Card key={tpl.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  {tpl.departurePoint} → {tpl.destination}
                </div>
                {tpl.isPublic ? (
                  <Badge variant="default">Público</Badge>
                ) : (
                  <Badge variant="outline">Privado</Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {SHIFT_LABEL[tpl.shift] ?? tpl.shift} ·{" "}
                  {tpl.stops?.length ?? 0} paradas
                </span>
                <Button variant="ghost" size="sm" disabled>
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}