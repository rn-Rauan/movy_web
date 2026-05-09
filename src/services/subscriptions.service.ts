import { api } from "@/lib/api";
import type { Subscription, PlanUsage } from "@/lib/types";

export const subscriptionsService = {
  getActive: (orgId: string) => api<Subscription>(`/organizations/${orgId}/subscriptions/active`),
  list: (orgId: string) => api<Subscription[]>(`/organizations/${orgId}/subscriptions`),
  create: (orgId: string, planId: string) =>
    api<Subscription>(`/organizations/${orgId}/subscriptions`, {
      method: "POST",
      body: JSON.stringify({ planId: Number(planId) }),
    }),
  changePlan: (orgId: string, subscriptionId: string, planId: string) =>
    api<Subscription>(`/organizations/${orgId}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify({ planId: Number(planId) }),
    }),
  getPlanUsage: (orgId: string) => api<PlanUsage>(`/organizations/${orgId}/plan-usage`),
};
