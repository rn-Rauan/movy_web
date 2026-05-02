import { api } from "@/lib/api";
import type { TripInstance, Paginated } from "@/lib/types";

export const tripsService = {
  listPublic: () =>
    api<Paginated<TripInstance>>("/public/trip-instances", { auth: false }),

  listByOrgId: (orgId: string) =>
    api<TripInstance[] | Paginated<TripInstance>>(`/trip-instances/organization/${orgId}`),

  listBySlug: (slug: string) =>
    api<TripInstance[] | Paginated<TripInstance>>(`/public/trip-instances/org/${slug}`, { auth: false }),

  getPublicById: (id: string) =>
    api<TripInstance>(`/public/trip-instances/${id}`, { auth: false }),
};
