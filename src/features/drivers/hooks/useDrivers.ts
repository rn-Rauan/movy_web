import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { driversService } from "@/services/drivers.service";
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
        const msg = err instanceof Error ? err.message : "Erro ao carregar motoristas";
        setError(msg);
        toast.error(msg);
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