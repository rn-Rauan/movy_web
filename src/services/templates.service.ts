import { api } from "@/lib/api";
import type { TripTemplate, Paginated, Weekday, GenerateInstancesResult } from "@/lib/types";

type TemplateCreatePayload = {
  departurePoint: string;
  destination: string;
  stops: string[];
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  /** HH:mm UTC */
  departureTimeOfDay: string;
  /** HH:mm UTC */
  arrivalTimeOfDay: string;
  defaultCapacity: number;
  /** When BOTH defaults are set, generated instances are created as SCHEDULED (skip DRAFT). */
  defaultDriverId?: string | null;
  defaultVehicleId?: string | null;
  priceOneWay?: number;
  priceReturn?: number;
  priceRoundTrip?: number;
  isPublic: boolean;
  isRecurring?: boolean;
  frequency?: Weekday[];
  minRevenue?: number;
  autoCancelEnabled?: boolean;
  autoCancelOffset?: number;
};

type TemplateUpdatePayload = Partial<TemplateCreatePayload>;

export const templatesService = {
  listByOrgId: (orgId: string) =>
    api<TripTemplate[] | Paginated<TripTemplate>>(`/trip-templates/organization/${orgId}`),

  getById: (id: string) => api<TripTemplate>(`/trip-templates/${id}`),

  create: (orgId: string, data: TemplateCreatePayload) =>
    api<TripTemplate>(`/trip-templates/organization/${orgId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: TemplateUpdatePayload) =>
    api<TripTemplate>(`/trip-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) => api<void>(`/trip-templates/${id}`, { method: "DELETE" }),

  generateInstances: (id: string, daysAhead?: number) =>
    api<GenerateInstancesResult>(`/trip-templates/${id}/generate-instances`, {
      method: "POST",
      body: JSON.stringify(daysAhead !== undefined ? { daysAhead } : {}),
    }),
};
