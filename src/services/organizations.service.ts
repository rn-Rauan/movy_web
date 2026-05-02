import { api } from "@/lib/api";
import type { Organization, Paginated } from "@/lib/types";

export const organizationsService = {
  listActive: () =>
    api<Organization[] | Paginated<Organization>>("/organizations/active"),

  listMine: () =>
    api<Paginated<Organization>>("/organizations/me"),
};
