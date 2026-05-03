import { api } from "@/lib/api";
import type { TripTemplate, Paginated } from "@/lib/types";

type TemplatePayload = {
  departurePoint: string;
  destination: string;
  stops: string[];
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  priceOneWay?: number;
  priceReturn?: number;
  priceRoundTrip?: number;
  isPublic: boolean;
  isRecurring?: boolean;
  autoCancelEnabled?: boolean;
};

export const templatesService = {
  listByOrgId: (orgId: string) =>
    api<TripTemplate[] | Paginated<TripTemplate>>(`/trip-templates/organization/${orgId}`),

  getById: (id: string) => api<TripTemplate>(`/trip-templates/${id}`),

  create: (orgId: string, data: TemplatePayload) =>
    api<TripTemplate>(`/trip-templates/organization/${orgId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<TemplatePayload>) =>
    api<TripTemplate>(`/trip-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) => api<void>(`/trip-templates/${id}`, { method: "DELETE" }),
};
