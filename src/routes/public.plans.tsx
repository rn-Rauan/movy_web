import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Bus, Users, MapPin, Calendar, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { plansService } from "@/services/plans.service";
import { apiErrorMessage } from "@/lib/handle-error";
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
        setError(apiErrorMessage(err, "Erro ao carregar planos"));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = plans === null && !error;

  return (
    <AppShell title="Planos" back>
      <section className="mb-6 text-center">
        <h1 className="text-balance text-[24px] font-extrabold tracking-[-0.6px] text-ink">
          Planos para sua empresa
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-balance text-[13px] text-muted-foreground">
          Escolha o plano que mais combina com o tamanho da sua operação. Mude a qualquer momento.
        </p>
      </section>

      {loading ? (
        <LoadingList count={3} height="h-56" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : plans && plans.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-surface p-8 text-center text-[13px] text-muted-foreground">
          Nenhum plano disponível no momento.
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-3">
          {(plans ?? []).map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} highlighted={i === 1} />
          ))}
        </div>
      )}

      <div className="mb-3 rounded-[14px] border border-accent/30 bg-accent-soft p-4">
        <h3 className="text-[14px] font-extrabold text-ink">Pronto para começar?</h3>
        <p className="mt-1 text-[12px] text-ink-2">
          Cadastre sua empresa em poucos minutos e comece a gerenciar viagens hoje.
        </p>
        <Link
          to="/signup/empresa"
          className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-[12px] bg-ink text-[13px] font-bold text-surface hover:bg-ink/90"
        >
          Cadastrar empresa <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </Link>
      </div>
    </AppShell>
  );
}

function PlanCard({ plan, highlighted }: { plan: Plan; highlighted?: boolean }) {
  return (
    <div
      className={`relative rounded-[14px] border bg-surface p-4 ${
        highlighted ? "border-2 border-accent shadow-sm" : "border-line"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.4px] text-white">
          Mais popular
        </div>
      )}
      <div className="mb-3.5">
        <h3 className="text-[16px] font-extrabold tracking-[-0.2px] text-ink">{plan.name}</h3>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-mono text-[28px] font-extrabold tracking-[-0.5px] text-ink">
            {formatPrice(plan.price)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            / {plan.durationDays === 30 ? "mês" : `${plan.durationDays} dias`}
          </span>
        </div>
      </div>

      <ul className="mb-4 flex flex-col gap-1.5 text-[13px] text-ink-2">
        <Feature icon={<Bus className="h-4 w-4" strokeWidth={1.6} />}>
          Até <strong className="text-ink">{plan.maxVehicles}</strong>{" "}
          {plan.maxVehicles === 1 ? "veículo" : "veículos"}
        </Feature>
        <Feature icon={<Users className="h-4 w-4" strokeWidth={1.6} />}>
          Até <strong className="text-ink">{plan.maxDrivers}</strong>{" "}
          {plan.maxDrivers === 1 ? "motorista" : "motoristas"}
        </Feature>
        <Feature icon={<Calendar className="h-4 w-4" strokeWidth={1.6} />}>
          {isUnlimitedPlanLimit(plan.maxMonthlyTrips) ? (
            <>
              <strong className="text-ink">Viagens ilimitadas</strong> por mês
            </>
          ) : (
            <>
              Até <strong className="text-ink">{plan.maxMonthlyTrips}</strong> viagens por mês
            </>
          )}
        </Feature>
        <Feature icon={<MapPin className="h-4 w-4" strokeWidth={1.6} />}>
          Templates de rota ilimitados
        </Feature>
        <Feature icon={<Check className="h-4 w-4" strokeWidth={1.6} />}>
          Página pública para divulgar viagens
        </Feature>
      </ul>

      <Link
        to="/signup/empresa"
        className={`flex h-11 w-full items-center justify-center rounded-[12px] text-[13px] font-bold transition-colors ${
          highlighted
            ? "bg-ink text-surface hover:bg-ink/90"
            : "border border-line bg-surface text-ink hover:bg-line-soft"
        }`}
      >
        Começar com {plan.name}
      </Link>
    </div>
  );
}

function Feature({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
