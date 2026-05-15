import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { organizationsService } from "@/services/organizations.service";
import type { Organization } from "@/lib/types";

export function useOrganizations() {
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    organizationsService
      .listActive()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setOrgs(list);
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

  const hasActiveFilters = search.trim() !== "";

  function resetFilters() {
    setSearch("");
  }

  return {
    orgs,
    filtered,
    search,
    setSearch,
    resetFilters,
    hasActiveFilters,
    loading: orgs === null && !error,
    error,
  };
}
