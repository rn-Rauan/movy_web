import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { PublicShell } from "@/components/layout/PublicShell";
import { AudienceCard } from "@/components/passenger/AudienceCard";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, adminOrgId, roleLoading } = useRole();

  if (authLoading || (isAuthenticated && roleLoading)) return null;

  if (isAuthenticated) {
    if (isAdmin && adminOrgId) return <Navigate to="/dashboard" />;
    return <Navigate to="/public/trip-instances" />;
  }

  return <LandingPage />;
}

function LandingPage() {
  return (
    <PublicShell>
      <div className="pt-7 pb-8">
        <section className="mb-6">
          <h1 className="text-balance text-[30px] font-extrabold leading-[1.08] tracking-[-1px] text-ink">
            Viagens compartilhadas pra empresas e passageiros.
          </h1>
          <p className="mt-3 text-[14px] leading-[1.5] text-ink-2">
            Reserve sua próxima viagem ou gerencie sua frota em um só lugar.
          </p>
        </section>

        <section className="mb-6 flex flex-col gap-2.5">
          <AudienceCard
            kind="passenger"
            to="/public/trip-instances"
            icon={<MapPin className="h-5 w-5" strokeWidth={1.8} />}
            title="Quero reservar viagens"
            body="Encontre viagens perto de você e garanta sua vaga em segundos."
            cta="Ver viagens"
          />
          <AudienceCard
            kind="company"
            to="/signup/empresa"
            icon={<Building2 className="h-5 w-5" strokeWidth={1.8} />}
            title="Tenho empresa de transporte"
            body="Cadastre sua empresa, organize sua frota e cobre passageiros."
            cta="Cadastrar empresa"
          />
          <Link
            to="/public/plans"
            className="inline-flex items-center gap-1 self-start pl-0.5 text-[12px] font-bold text-accent hover:underline"
          >
            Comparar planos e preços <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
        </section>

        <section className="mb-7">
          <div className="mb-3 pl-0.5 text-[11px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
            Como funciona
          </div>
          <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
            {[
              { n: 1, t: "Cadastre", d: "Crie sua conta em poucos passos." },
              { n: 2, t: "Gerencie", d: "Organize viagens, rotas e motoristas." },
              { n: 3, t: "Embarque", d: "Pague no app, vaga garantida." },
            ].map((s, i) => (
              <div
                key={s.n}
                className={`flex items-center gap-3.5 px-3.5 py-3.5 ${
                  i ? "border-t border-line" : ""
                }`}
              >
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ink font-mono text-[12px] font-bold text-surface">
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-ink">{s.t}</div>
                  <div className="mt-px text-[12px] leading-snug text-muted-foreground">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-7 flex items-center justify-between border-t border-line pt-4 text-[11px] text-muted-foreground">
          <span>© 2026 movy</span>
          <div className="flex items-center gap-3.5">
            <Link to="/public/plans" className="hover:text-ink">
              Planos
            </Link>
            <Link to="/login" className="hover:text-ink">
              Entrar
            </Link>
          </div>
        </footer>
      </div>
    </PublicShell>
  );
}
