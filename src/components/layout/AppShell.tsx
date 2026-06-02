import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "./BottomNav";

type Props = {
  title: string;
  back?: boolean;
  children: React.ReactNode;
  showTabs?: boolean;
  /** Conteúdo opcional alinhado à direita no header (antes do logout). */
  action?: React.ReactNode;
};

export function AppShell({ title, back, children, showTabs = true, action }: Props) {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-[18px]">
          <div className="flex min-w-0 items-center gap-2.5">
            {back && (
              <button
                onClick={() => router.history.back()}
                aria-label="Voltar"
                className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-line-soft"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
              </button>
            )}
            <h1 className="truncate text-[19px] font-extrabold tracking-[-0.3px] text-ink">
              {title}
            </h1>
          </div>
          <div className="flex flex-none items-center gap-1.5">
            {action}
            {isAuthenticated ? (
              <button
                onClick={logout}
                aria-label="Sair"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition hover:bg-line-soft"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            ) : (
              <Link
                to="/login"
                search={{ redirect: pathname }}
                aria-label="Entrar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition hover:bg-line-soft"
              >
                <LogIn className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-3.5 pb-28">{children}</main>
      {showTabs && <BottomNav />}
    </div>
  );
}
