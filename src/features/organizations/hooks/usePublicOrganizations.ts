import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { tripsService } from "@/services/trips.service";
import type { Organization, Paginated, TripInstance } from "@/lib/types";

type PublicTrip = TripInstance & { organizationName?: string; organizationSlug?: string };

/**
 * Public list of organizations derived from `tripsService.listPublic()`. We dedupe by slug —
 * the backend doesn't expose a public `/organizations` list, but every public trip carries
 * `organizationSlug` + `organizationName`, which is enough to build a discovery surface.
 *
 * Limitations vs. `useOrganizations` (protected): no contact info, no address, no rating.
 * `CompanyCard` already gracefully omits those fields when missing.
 */
export function usePublicOrganizations() {
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (tripsService.listPublic() as Promise<Paginated<PublicTrip> | PublicTrip[]>)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        const map = new Map<string, Organization>();
        for (const t of list) {
          if (!t.organizationSlug || !t.organizationName) continue;
          if (map.has(t.organizationSlug)) continue;
          map.set(t.organizationSlug, {
            id: t.organizationId,
            slug: t.organizationSlug,
            name: t.organizationName,
          });
        }
        setOrgs([...map.values()].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        toast.error(err.message);
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
