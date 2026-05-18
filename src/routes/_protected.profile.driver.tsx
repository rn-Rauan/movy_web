import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import {
  DriverProfileForm,
  type DriverFormPayload,
} from "@/features/drivers/components/DriverProfileForm";
import { useMyDriver } from "@/features/drivers/hooks/useMyDriver";
import { useRole } from "@/lib/role-context";
import { driversService } from "@/services/drivers.service";
import { handleApiError } from "@/lib/handle-error";

export const Route = createFileRoute("/_protected/profile/driver")({
  component: DriverProfilePage,
});

function DriverProfilePage() {
  const { driver, setDriver, loading, notFound, error, refetch } = useMyDriver();
  const { isDriver, refetchRole } = useRole();
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(payload: DriverFormPayload) {
    setSubmitting(true);
    try {
      const created = await driversService.createMe(payload);
      setDriver(created);
      refetchRole();
      toast.success("Perfil de motorista ativado");
      refetch();
    } catch (err) {
      handleApiError(err, "Erro ao ativar perfil de motorista");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(payload: DriverFormPayload) {
    if (!driver) return;
    setSubmitting(true);
    try {
      const updated = await driversService.update(driver.id, payload);
      setDriver(updated);
      toast.success("Dados atualizados");
    } catch (err) {
      handleApiError(err, "Erro ao atualizar perfil");
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
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-base font-semibold">Seus dados</h2>
                <p className="text-xs text-muted-foreground">
                  CNH e categoria registradas no sistema.
                </p>
              </div>
              <StatusBadge status={driver.driverStatus} />
            </div>

            {!isDriver ? (
              <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 mb-4">
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
              <Button asChild variant="outline" size="sm" className="mb-4 w-full">
                <Link to="/my-trips">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver minhas viagens como motorista
                </Link>
              </Button>
            )}

            <DriverProfileForm
              mode="edit"
              initialData={driver}
              submitting={submitting}
              onSubmit={handleUpdate}
            />
          </Card>
        </>
      ) : null}
    </AppShell>
  );
}

function StatusBadge({ status }: { status: "ACTIVE" | "INACTIVE" | "SUSPENDED" }) {
  if (status === "ACTIVE") return <Badge>Ativo</Badge>;
  if (status === "SUSPENDED") return <Badge variant="outline">Suspenso</Badge>;
  return <Badge variant="secondary">Inativo</Badge>;
}
