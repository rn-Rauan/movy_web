import { api } from "@/lib/api";
import type { Organization, Paginated } from "@/lib/types";

type OrgUpdatePayload = {
  name?: string;
  email?: string;
  cnpj?: string;
  telephone?: string;
  slug?: string;
  address?: string;
};

export const organizationsService = {
  listActive: () => api<Organization[] | Paginated<Organization>>("/organizations/active"),

  /** Public directory of active organizations — anonymous, paginated. */
  listPublic: (page = 1, limit = 50) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    return api<Organization[] | Paginated<Organization>>(`/public/organizations?${qs.toString()}`, {
      auth: false,
    });
  },

  listMine: () => api<Paginated<Organization>>("/organizations/me"),

  getBySlug: (slug: string) => api<Organization>(`/public/organizations/${slug}`, { auth: false }),

  update: (id: string, data: OrgUpdatePayload) =>
    api<Organization>(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
