import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/handle-error";
import { schedulingService } from "@/services/scheduling.service";
import type { TripSchedulingConfig } from "@/lib/types";

export function useSchedulingConfig(orgId: string | null | undefined) {
  const [config, setConfig] = useState<TripSchedulingConfig | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setConfig(null);
    setNotFound(false);
    setError(null);
    setLoading(true);
    schedulingService
      .getConfig(orgId)
      .then((cfg) => {
        setConfig(cfg);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          return;
        }
        setError(apiErrorMessage(err, "Erro ao carregar configuração de agendamento"));
      });
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    config,
    setConfig,
    loading,
    notFound,
    error,
    refetch,
  };
}
