import { SubscriptionCard } from "./SubscriptionCard";
import type { Plan, Subscription } from "@/lib/types";

type Props = {
  subscriptions: Subscription[];
  plans: Map<string, Plan>;
};

export function SubscriptionsList({ subscriptions, plans }: Props) {
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface-2 p-6 text-center text-[13px] text-muted-foreground">
        Nenhuma assinatura registrada ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {subscriptions.map((s) => (
        <SubscriptionCard key={s.id} subscription={s} plan={plans.get(s.planId)} />
      ))}
    </div>
  );
}
