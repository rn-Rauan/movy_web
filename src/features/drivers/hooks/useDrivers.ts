import { useCallback, useEffect, useState } from "react";
import { driversService } from "@/services/drivers.service";
import { handleApiError } from "@/lib/handle-error";
import type { Driver, Paginated } from "@/lib/types";

export const DRIVER_ROLE_ID = 2;

export function useDrivers(orgId: string | null | undefined) {
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!orgId) return;
    setDrivers(null);
    setError(null);
    driversService
      .listByOrgId(orgId)
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as Paginated<Driver>).data ?? []);
        setDrivers(list);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar motoristas");
        handleApiError(err, "Erro ao carregar motoristas");
      });
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    drivers,
    setDrivers,
    loading: drivers === null && !error,
    error,
    refetch,
  };
}
