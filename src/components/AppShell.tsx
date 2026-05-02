import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";

type Props = {
  title: string;
  back?: boolean;
  children: React.ReactNode;
  showTabs?: boolean;
};

export function AppShell({ title, back, children, showTabs = true }: Props) {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="mx-auto max-w-md flex items-center gap-2 px-4 h-14">
          {back ? (
            <button
              onClick={() => router.history.back()}
              aria-label="Voltar"
              className="p-2 -ml-2 rounded-lg hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <h1 className="text-lg font-semibold flex-1 truncate">{title}</h1>
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-md px-4 py-4 pb-24">{children}</main>
      {showTabs && <BottomNav />}
    </div>
  );
}
