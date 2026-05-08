import { api } from "@/lib/api";
import type { Payment, Paginated } from "@/lib/types";

export const paymentsService = {
  list: (orgId: string, page = 1, size = 20) =>
    api<Paginated<Payment> | Payment[]>(
      `/organizations/${orgId}/payments?page=${page}&size=${size}`,
    ),
  getById: (orgId: string, id: string) => api<Payment>(`/organizations/${orgId}/payments/${id}`),
};
