import { useEffect, useState } from "react";
import { toast } from "sonner";
import { organizationsService } from "@/services/organizations.service";
import type { Organization } from "@/lib/types";

export function useOrganizations() {
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return { orgs, loading: orgs === null && !error, error };
}
