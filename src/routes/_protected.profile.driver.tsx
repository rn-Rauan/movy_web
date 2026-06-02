import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { LoginRequired } from "@/components/feedback/LoginRequired";
import { useAuth } from "@/lib/auth-context";
import {
  DriverProfileForm,
  type DriverFormPayload,
} from "@/features/drivers/components/DriverProfileForm";
import { EditMyDriverDialog } from "@/features/drivers/components/EditMyDriverDialog";
import { useMyDriver } from "@/features/drivers/hooks/useMyDriver";
import { useRole } from "@/lib/role-context";
import { driversService } from "@/services/drivers.service";
import { handleApiError } from "@/lib/handle-error";
import { formatDateOnly } from "@/lib/format";
import type { Driver } from "@/lib/types";

export const Route = createFileRoute("/_protected/profile/driver")({
  component: DriverProfilePage,
});

function DriverProfilePage() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <AppShell title="Perfil de motorista" back>
        <LoginRequired message="Entre na sua conta para acessar o perfil de motorista." />
      </AppShell>
    );
  }
  return <DriverProfileContent />;
}

function DriverProfileContent() {
  const { driver, setDriver, loading, notFound, error } = useMyDriver();
  const { isDriver, refetchRole } = useRole();
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  async function handleCreate(payload: DriverFormPayload) {
    setSubmitting(true);
    try {
      const created = await driversService.createMe(payload);
      setDriver(created);
      refetchRole();
      toast.success("Perfil de motorista ativado");
    } catch (err) {
      handleApiError(err, "Erro ao ativar perfil de motorista");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Perfil de motorista" back>
      {loading ? (
        <LoadingList count={2} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : notFound ? (
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-1">Ativar perfil de motorista</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Preencha os dados da sua CNH abaixo. Você só vai ver as funcionalidades de motorista
            depois que um admin vincular você à organização dele.
          </p>
          <DriverProfileForm mode="create" submitting={submitting} onSubmit={handleCreate} />
        </Card>
      ) : driver ? (
        <>
          <Card className="p-5 mb-4">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-semibold">Seus dados</h2>
                <p className="text-xs text-muted-foreground">
                  CNH e categorias registradas no sistema.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={driver.driverStatus} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditing(driver)}
                  aria-label="Editar dados"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <dl className="space-y-3 text-sm mb-4">
              <Row label="CNH" value={driver.cnh} />
              <Row
                label="Categorias"
                value={
                  <div className="flex flex-wrap gap-1">
                    {driver.cnhCategories.map((c) => (
                      <Badge key={c} variant="outline" className="font-mono">
                        {c}
                      </Badge>
                    ))}
                  </div>
                }
              />
              <Row label="Validade" value={formatDateOnly(driver.cnhExpiresAt)} />
            </dl>

            {!isDriver ? (
              <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    Seu perfil foi cadastrado, mas você ainda não está vinculado a nenhuma empresa.
                    Funcionalidades de motorista (ver viagens, confirmar presença) só ficam
                    disponíveis após um admin te vincular à organização dele.
                  </p>
                </div>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/my-trips">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver minhas viagens como motorista
                </Link>
              </Button>
            )}
          </Card>

          <EditMyDriverDialog
            driver={editing}
            onClose={() => setEditing(null)}
            onUpdated={(updated) => setDriver({ ...driver, ...updated })}
          />
        </>
      ) : null}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: "ACTIVE" | "INACTIVE" | "SUSPENDED" }) {
  if (status === "ACTIVE") return <Badge>Ativo</Badge>;
  if (status === "SUSPENDED") return <Badge variant="outline">Suspenso</Badge>;
  return <Badge variant="secondary">Inativo</Badge>;
}
