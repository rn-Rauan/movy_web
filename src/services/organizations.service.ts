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
  listActive: () =>
    api<Organization[] | Paginated<Organization>>("/organizations/active"),

  listMine: () =>
    api<Paginated<Organization>>("/organizations/me"),

  update: (id: string, data: OrgUpdatePayload) =>
    api<Organization>(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
