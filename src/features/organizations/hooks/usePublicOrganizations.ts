import { useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "@/lib/handle-error";
import { organizationsService } from "@/services/organizations.service";
import type { Organization, Paginated } from "@/lib/types";

/**
 * Public directory of active organizations via `GET /public/organizations` (anonymous).
 * Lists every active org — including those without public trips — and carries contact/address
 * fields, which `CompanyCard` renders when present.
 */
export function usePublicOrganizations() {
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (organizationsService.listPublic() as Promise<Paginated<Organization> | Organization[]>)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setOrgs([...list].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err, "Erro ao carregar organizações"));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = orgs ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) => o.name?.toLowerCase().includes(q) || o.slug?.toLowerCase().includes(q),
    );
  }, [orgs, search]);

  return {
    orgs,
    filtered,
    search,
    setSearch,
    loading: orgs === null && !error,
    error,
  };
}
