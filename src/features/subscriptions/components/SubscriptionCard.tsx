import { cn } from "@/lib/utils";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Plan, Subscription, SubscriptionStatus } from "@/lib/types";

const STATUS: Record<SubscriptionStatus, { label: string; cls: string }> = {
  ACTIVE: { label: "ATIVA", cls: "bg-success-soft text-success" },
  CANCELED: { label: "CANCELADA", cls: "bg-line-soft text-muted-foreground" },
  EXPIRED: { label: "EXPIRADA", cls: "bg-danger-soft text-danger" },
};

export function SubscriptionCard({
  subscription: s,
  plan,
}: {
  subscription: Subscription;
  plan?: Plan;
}) {
  const status = STATUS[s.status];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface p-3.5",
        s.status === "ACTIVE" ? "border-accent/40" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-extrabold tracking-[-0.2px] text-ink">
            {plan?.name ?? "Plano"}
          </div>
          {plan && (
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="font-mono text-[13px] font-bold text-ink-2">
                {formatPrice(plan.price)}
              </span>
              <span className="text-[11px] text-muted-foreground">/mês</span>
            </div>
          )}
        </div>
        <span
          className={cn(
            "flex-none rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.3px]",
            status.cls,
          )}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-1 border-t border-line-soft pt-2.5 text-[12px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Início</span>
          <span className="font-medium text-ink-2">{formatDateTime(s.startDate)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Validade</span>
          <span className="font-medium text-ink-2">{formatDateTime(s.expiresAt)}</span>
        </div>
      </div>
    </div>
  );
}
