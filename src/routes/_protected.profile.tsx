import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Mail, User as UserIcon, LogOut } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <AppShell title="Perfil">
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{user?.name ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{user?.email ?? "—"}</div>
          </div>
          <Button size="sm" variant="outline" disabled>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3 text-sm border-t border-border pt-4">
          <Field icon={<UserIcon className="h-4 w-4" />} label="Nome" value={user?.name} />
          <Field icon={<Mail className="h-4 w-4" />} label="E-mail" value={user?.email} />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Conta</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" disabled>
            Alterar senha
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </Button>
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