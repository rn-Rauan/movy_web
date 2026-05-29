import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  kind: "passenger" | "company";
  title: string;
  body: string;
  cta: string;
  to: string;
  icon: ReactNode;
};

export function AudienceCard({ kind, title, body, cta, to, icon }: Props) {
  const company = kind === "company";
  return (
    <Link
      to={to as string}
      className={cn(
        "flex items-center gap-3.5 rounded-2xl p-[18px] text-left transition-transform hover:scale-[0.995]",
        company ? "bg-ink text-surface" : "border border-line bg-surface text-ink",
      )}
    >
      <span
        className={cn(
          "flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl",
          company ? "bg-white/10 text-accent" : "bg-accent-soft text-accent",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[15px] font-extrabold tracking-[-0.3px]",
            company ? "text-surface" : "text-ink",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[12px] leading-snug",
            company ? "text-white/65" : "text-muted-foreground",
          )}
        >
          {body}
        </span>
        <span
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-[12px] font-bold",
            company ? "text-surface" : "text-accent",
          )}
        >
          {cta} <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </span>
      </span>
    </Link>
  );
}
