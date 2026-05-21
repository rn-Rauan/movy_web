import { api } from "@/lib/api";
import type { CnhCategory, Driver, Paginated } from "@/lib/types";

type DriverLookup = {
  driverId: string;
  userId: string;
  userName: string;
  userEmail: string;
  cnhCategories: CnhCategory[];
  cnhExpiresAt: string;
  driverStatus: string;
};

export const driversService = {
  createMe: (payload: { cnh: string; cnhCategories: CnhCategory[]; cnhExpiresAt: string }) =>
    api<Driver>("/drivers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => api<Driver>("/drivers/me"),

  /**
   * Self-service driver update (PATCH /drivers/me).
   * Only `cnhExpiresAt` and `cnhCategories` are editable here — `cnh` and `driverStatus` remain admin-only via PUT /drivers/{id}.
   */
  updateMe: (data: Partial<{ cnhExpiresAt: string; cnhCategories: CnhCategory[] }>) =>
    api<Driver>("/drivers/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

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

  restoreMembership: (userId: string, roleId: number, orgId: string) =>
    api<boolean>(`/memberships/${userId}/${roleId}/${orgId}/restore`, {
      method: "PATCH",
    }),

  /**
   * Admin-only update (PUT /drivers/{id}).
   * To change the CNH, send `cnh` + `cnhCategories` + `cnhExpiresAt` together (all-or-nothing) — partial CNH update returns `INVALID_PARTIAL_CNH_UPDATE_BAD_REQUEST`.
   * `status` is independent.
   */
  update: (
    id: string,
    data: Partial<{
      cnh: string;
      cnhCategories: CnhCategory[];
      cnhExpiresAt: string;
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    }>,
  ) =>
    api<Driver>(`/drivers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getName: (id: string) => api<{ name: string }>(`/drivers/${id}/name`),
};
