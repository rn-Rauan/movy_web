import { useCallback, useEffect, useState } from "react";
import { handleApiError } from "@/lib/handle-error";
import { templatesService } from "@/services/templates.service";
import type { TripTemplate } from "@/lib/types";

export function useTemplates(orgId: string | null | undefined) {
  const [templates, setTemplates] = useState<TripTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!orgId) return;
    setTemplates(null);
    setError(null);
    templatesService
      .listByOrgId(orgId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setTemplates(list);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar templates");
        handleApiError(err, "Erro ao carregar templates");
      });
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    templates,
    setTemplates,
    loading: templates === null && !error,
    error,
    refetch,
  };
}