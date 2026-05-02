import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_protected/_driver/my-trips")({
  component: DriverTripsPage,
});

function DriverTripsPage() {
  return (
    <AppShell title="Como motorista">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Viagens em que você está designado como motorista.
        </p>
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-medium">Em construção</p>
          <p className="text-xs text-muted-foreground mt-1">
            Em breve: status da viagem, presença e pagamento.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
