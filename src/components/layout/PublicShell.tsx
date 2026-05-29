import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Show the "Entrar" button on the right side. Default true. */
  showEntrar?: boolean;
  /** Optional subtitle shown after a "/" separator next to the logo */
  title?: string;
  className?: string;
};

export function PublicShell({ children, showEntrar = true, title, className }: Props) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-[18px]">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-ink">
              <Bus className="h-[15px] w-[15px] text-surface" strokeWidth={1.8} />
            </span>
            <span className="text-[17px] font-extrabold tracking-[-0.5px] text-ink">movy</span>
            {title && (
              <>
                <span className="text-line">/</span>
                <span className="truncate text-[15px] font-bold text-ink-2">{title}</span>
              </>
            )}
          </Link>
          {showEntrar && (
            <Link
              to="/login"
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] font-bold text-ink transition hover:bg-line-soft"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-3.5 pb-10">{children}</main>
    </div>
  );
}
