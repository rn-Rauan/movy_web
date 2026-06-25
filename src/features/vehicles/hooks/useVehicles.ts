import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "@/lib/handle-error";
import { vehiclesService } from "@/services/vehicles.service";
import type { Paginated, Vehicle } from "@/lib/types";

export function useVehicles(orgId: string | null | undefined) {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!orgId) return;
    setVehicles(null);
    setError(null);
    vehiclesService
      .listByOrgId(orgId)
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as Paginated<Vehicle>).data ?? []);
        setVehicles(list);
      })
      .catch((err) => {
        setError(apiErrorMessage(err, "Erro ao carregar veículos"));
      });
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    vehicles,
    setVehicles,
    loading: vehicles === null && !error,
    error,
    refetch,
  };
}
