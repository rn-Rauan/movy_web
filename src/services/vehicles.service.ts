import { api } from "@/lib/api";
import type { Vehicle, Paginated } from "@/lib/types";

type VehicleCreatePayload = {
  plate: string;
  model: string;
  type: "VAN" | "BUS" | "MINIBUS" | "CAR";
  maxCapacity: number;
};

type VehicleUpdatePayload = Partial<VehicleCreatePayload & { status: "ACTIVE" | "INACTIVE" }>;

export const vehiclesService = {
  listByOrgId: (orgId: string) =>
    api<Vehicle[] | Paginated<Vehicle>>(`/vehicles/organization/${orgId}`),

  create: (orgId: string, data: VehicleCreatePayload) =>
    api<Vehicle>(`/vehicles/organization/${orgId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: VehicleUpdatePayload) =>
    api<Vehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deactivate: (id: string) => api<void>(`/vehicles/${id}`, { method: "DELETE" }),
};
