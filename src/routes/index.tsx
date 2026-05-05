import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Building2, CreditCard, MapPin, Settings2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";

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
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
        {/* Hero */}
        <section className="text-center space-y-4 mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/20">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            A plataforma de viagens compartilhadas pra empresas e passageiros
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Reserve sua próxima viagem ou gerencie sua frota, motoristas e cobrança em um só lugar.
          </p>
        </section>

        {/* CTAs */}
        <section className="grid gap-4 sm:grid-cols-2 mb-12">
          <Link to="/public/trip-instances" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Quero reservar viagens</h2>
                <p className="text-sm text-muted-foreground flex-1">
                  Explore viagens disponíveis perto de você e garanta sua vaga em segundos.
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Ver viagens
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/signup/empresa" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground mb-4">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Tenho empresa de transporte</h2>
                <p className="text-sm text-muted-foreground flex-1">
                  Cadastre sua empresa, organize sua frota e cobre passageiros sem complicação.
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Cadastrar empresa
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Como funciona */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-5 text-center">Como funciona</h2>
          <ol className="space-y-3">
            <Step
              n={1}
              icon={<UserPlus className="h-5 w-5" />}
              title="Cadastre"
              text="Crie sua conta como passageiro ou empresa em poucos passos."
            />
            <Step
              n={2}
              icon={<Settings2 className="h-5 w-5" />}
              title="Gerencie"
              text="Organize viagens, templates de rota e equipe de motoristas."
            />
            <Step
              n={3}
              icon={<CreditCard className="h-5 w-5" />}
              title="Cobre"
              text="Receba pagamentos e acompanhe inscrições em tempo real."
            />
          </ol>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-2xl px-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Já tem conta?</span>
          <Button asChild variant="link" size="sm" className="px-1">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
      <div className="relative shrink-0">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
          {n}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </li>
  );
}
