import { api } from "@/lib/api";
import type { Plan } from "@/lib/types";

export const plansService = {
  getById: (id: string) => api<Plan>(`/plans/${id}`),
  list: () => api<Plan[]>("/plans"),
};
