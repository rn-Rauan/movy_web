import { api } from "@/lib/api";
import type { Subscription } from "@/lib/types";

export const subscriptionsService = {
  getActive: (orgId: string) => api<Subscription>(`/organizations/${orgId}/subscriptions/active`),
  list: (orgId: string) => api<Subscription[]>(`/organizations/${orgId}/subscriptions`),
};
