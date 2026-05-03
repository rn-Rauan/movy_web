import { api } from "@/lib/api";
import type { TripInstance, TripStatus, TripPassenger, Paginated } from "@/lib/types";

type TripCreatePayload = {
  tripTemplateId: string;
  departureTime: string;
  arrivalEstimate: string;
  totalCapacity: number;
  driverId?: string;
  vehicleId?: string;
  minRevenue?: number;
  initialStatus?: "DRAFT" | "SCHEDULED";
};

export const tripsService = {
  listPublic: () => api<Paginated<TripInstance>>("/public/trip-instances", { auth: false }),

  listByOrgId: (orgId: string) =>
    api<TripInstance[] | Paginated<TripInstance>>(`/trip-instances/organization/${orgId}`),

  listBySlug: (slug: string) =>
    api<TripInstance[] | Paginated<TripInstance>>(`/public/trip-instances/org/${slug}`, {
      auth: false,
    }),

  getPublicById: (id: string) => api<TripInstance>(`/public/trip-instances/${id}`, { auth: false }),

  getById: (id: string) => api<TripInstance>(`/trip-instances/${id}`),

  create: (orgId: string, data: TripCreatePayload) =>
    api<TripInstance>(`/trip-instances/organization/${orgId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, newStatus: TripStatus) =>
    api<TripInstance>(`/trip-instances/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ newStatus }),
    }),

  assignDriver: (id: string, driverId?: string) => {
    const qs = driverId ? `?driverId=${driverId}` : "";
    return api<TripInstance>(`/trip-instances/${id}/driver${qs}`, {
      method: "PUT",
    });
  },

  assignVehicle: (id: string, vehicleId?: string) => {
    const qs = vehicleId ? `?vehicleId=${vehicleId}` : "";
    return api<TripInstance>(`/trip-instances/${id}/vehicle${qs}`, {
      method: "PUT",
    });
  },

  listPassengers: (tripId: string) =>
    api<TripPassenger[]>(`/bookings/trip-instance/${tripId}/passengers`),
};
