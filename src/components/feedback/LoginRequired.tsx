import { Link, useRouterState } from "@tanstack/react-router";
import { Lock, ArrowRight } from "lucide-react";

interface LoginRequiredProps {
  title?: string;
  message?: string;
}

export function LoginRequired({
  title = "Faça login pra continuar",
  message = "Você precisa estar logado pra acessar esta tela.",
}: LoginRequiredProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-line bg-surface px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Lock className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-[17px] font-extrabold tracking-[-0.3px] text-ink">{title}</h3>
        <p className="mx-auto max-w-xs text-[13px] leading-[1.5] text-muted-foreground">
          {message}
        </p>
      </div>
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2">
        <Link
          to="/login"
          search={{ redirect: pathname }}
          className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[12px] bg-ink text-[13px] font-bold text-surface transition hover:bg-ink/90"
        >
          Entrar
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </Link>
        <Link
          to="/signup"
          className="inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-line bg-surface text-[13px] font-bold text-ink transition hover:bg-line-soft"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
