import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Bus, Users, MapPin, Calendar, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { plansService } from "@/services/plans.service";
import { formatPrice, isUnlimitedPlanLimit } from "@/lib/format";
import type { Plan, Paginated } from "@/lib/types";

export const Route = createFileRoute("/public/plans")({
  head: () => ({
    meta: [
      { title: "Planos para empresas de transporte" },
      {
        name: "description",
        content: "Escolha o plano ideal para sua empresa gerenciar frota, motoristas e cobrança.",
      },
    ],
  }),
  component: PublicPlansPage,
});

function PublicPlansPage() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    plansService
      .list()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : ((res as Paginated<Plan>).data ?? []);
        const active = list.filter((p) => p.isActive).sort((a, b) => a.price - b.price);
        setPlans(active);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = plans === null && !error;

  return (
    <AppShell title="Planos" back>
      <section className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Planos para sua empresa</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Escolha o plano que mais combina com o tamanho da sua operação. Você pode mudar de plano a
          qualquer momento.
        </p>
      </section>

      {loading ? (
        <LoadingList count={3} height="h-56" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : plans && plans.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhum plano disponível no momento.
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {(plans ?? []).map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} highlighted={i === 1} />
          ))}
        </div>
      )}

      <Card className="p-5 mb-4 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-sm mb-1">Pronto para começar?</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Cadastre sua empresa em poucos minutos e comece a gerenciar suas viagens hoje mesmo.
        </p>
        <Link to="/signup/empresa">
          <Button className="w-full">
            Cadastrar empresa
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </Card>
    </AppShell>
  );
}

function PlanCard({ plan, highlighted }: { plan: Plan; highlighted?: boolean }) {
  return (
    <Card className={`p-5 relative ${highlighted ? "border-primary border-2 shadow-md" : ""}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
          Mais popular
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
          <span className="text-xs text-muted-foreground">
            / {plan.durationDays === 30 ? "mês" : `${plan.durationDays} dias`}
          </span>
        </div>
      </div>

      <ul className="space-y-2 text-sm mb-4">
        <Feature icon={<Bus className="h-4 w-4" />}>
          Até <strong>{plan.maxVehicles}</strong> {plan.maxVehicles === 1 ? "veículo" : "veículos"}
        </Feature>
        <Feature icon={<Users className="h-4 w-4" />}>
          Até <strong>{plan.maxDrivers}</strong>{" "}
          {plan.maxDrivers === 1 ? "motorista" : "motoristas"}
        </Feature>
        <Feature icon={<Calendar className="h-4 w-4" />}>
          {isUnlimitedPlanLimit(plan.maxMonthlyTrips) ? (
            <>
              <strong>Viagens ilimitadas</strong> por mês
            </>
          ) : (
            <>
              Até <strong>{plan.maxMonthlyTrips}</strong> viagens por mês
            </>
          )}
        </Feature>
        <Feature icon={<MapPin className="h-4 w-4" />}>Templates de rota ilimitados</Feature>
        <Feature icon={<Check className="h-4 w-4" />}>Página pública para divulgar viagens</Feature>
      </ul>

      <Link to="/signup/empresa">
        <Button variant={highlighted ? "default" : "outline"} className="w-full">
          Começar com {plan.name}
        </Button>
      </Link>
    </Card>
  );
}

function Feature({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-primary mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
