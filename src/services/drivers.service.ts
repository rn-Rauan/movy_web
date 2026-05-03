import { api } from "@/lib/api";
import type { Driver, Paginated } from "@/lib/types";

type DriverLookup = {
  driverId: string;
  userId: string;
  userName: string;
  userEmail: string;
  cnhCategory: string;
  cnhExpiresAt: string;
  driverStatus: string;
};

export const driversService = {
  listByOrgId: (orgId: string) =>
    api<Driver[] | Paginated<Driver>>(`/drivers/organization/${orgId}`),

  lookup: (email: string, cnh: string) =>
    api<DriverLookup>(
      `/drivers/lookup?email=${encodeURIComponent(email)}&cnh=${encodeURIComponent(cnh)}`,
    ),

  addToOrg: (userEmail: string, cnh: string) =>
    api<{ userId: string; roleId: number; organizationId: string }>("/memberships/driver", {
      method: "POST",
      body: JSON.stringify({ userEmail, cnh }),
    }),

  removeMembership: (userId: string, roleId: number, orgId: string) =>
    api<boolean>(`/memberships/${userId}/${roleId}/${orgId}`, {
      method: "DELETE",
    }),
};
