import { useEffect, useState } from "react";
import { subscriptionsService } from "@/services/subscriptions.service";
import { plansService } from "@/services/plans.service";
import type { Plan, Subscription } from "@/lib/types";

/**
 * Histórico de assinaturas da organização (GET /organizations/{id}/subscriptions),
 * com o plano de cada uma resolvido via GET /public/plans (mapa planId → Plan).
 */
export function useSubscriptions(orgId: string | null | undefined) {
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [plans, setPlans] = useState<Map<string, Plan>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([subscriptionsService.list(orgId), plansService.list().catch(() => [] as Plan[])])
      .then(([subsRes, plansRes]) => {
        if (cancelled) return;
        const subs = Array.isArray(subsRes) ? subsRes : (subsRes.data ?? []);
        const plansList = Array.isArray(plansRes) ? plansRes : (plansRes.data ?? []);
        setPlans(new Map(plansList.map((p) => [p.id, p])));
        setSubscriptions(
          [...subs].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          ),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar assinaturas");
        setSubscriptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  return { subscriptions, plans, loading, error };
}
