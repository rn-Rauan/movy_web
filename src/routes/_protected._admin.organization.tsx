import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Building2, Mail, Phone, MapPin, Hash } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { organizationsService } from "@/services/organizations.service";
import type { Organization } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/organization")({
  component: OrganizationPage,
});

function OrganizationPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    organizationsService
      .listMine()
      .then((res) => {
        if (cancelled) return;
        setOrg(res.data?.[0] ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erro ao carregar empresa";
        setError(msg);
        toast.error(msg);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <AppShell title="Empresa">
        <ErrorCard message={error} />
      </AppShell>
    );
  }

  if (org === null) {
    return (
      <AppShell title="Empresa">
        <LoadingList count={1} height="h-48" />
      </AppShell>
    );
  }

  return (
    <AppShell title="Empresa">
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">{org.name}</h2>
            <p className="text-sm text-muted-foreground">/{org.slug}</p>
          </div>
          <Button size="sm" variant="outline" disabled>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <Field icon={<Hash className="h-4 w-4" />} label="CNPJ" value={org.cnpj} />
          <Field icon={<Mail className="h-4 w-4" />} label="E-mail" value={org.email} />
          <Field icon={<Phone className="h-4 w-4" />} label="Telefone" value={org.telephone} />
          <Field icon={<MapPin className="h-4 w-4" />} label="Endereço" value={org.address} />
          <Field icon={<Building2 className="h-4 w-4" />} label="Status" value={org.status} />
        </div>
      </Card>
    </AppShell>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm">{value ?? "—"}</div>
      </div>
    </div>
  );
}