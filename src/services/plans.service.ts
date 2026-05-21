import { api } from "@/lib/api";
import type { Paginated, Plan } from "@/lib/types";

export const plansService = {
  getById: (id: string) => api<Plan>(`/plans/${id}`),
  list: () => api<Paginated<Plan>>("/public/plans", { auth: false }),
};
