import { api } from "@/lib/api";
import type { Payment, Paginated } from "@/lib/types";

export const paymentsService = {
  list: (orgId: string, page = 1, limit = 20) =>
    api<Paginated<Payment> | Payment[]>(
      `/organizations/${orgId}/payments?page=${page}&limit=${limit}`,
    ),
  getById: (orgId: string, id: string) => api<Payment>(`/organizations/${orgId}/payments/${id}`),
  confirm: (orgId: string, paymentId: string) =>
    api<Payment>(`/organizations/${orgId}/payments/${paymentId}/confirm`, { method: "PATCH" }),
  fail: (orgId: string, paymentId: string) =>
    api<Payment>(`/organizations/${orgId}/payments/${paymentId}/fail`, { method: "PATCH" }),
};
