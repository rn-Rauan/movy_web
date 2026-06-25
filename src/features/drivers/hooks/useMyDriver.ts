import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/handle-error";
import { driversService } from "@/services/drivers.service";
import type { Driver } from "@/lib/types";

/**
 * Treat as "driver does not exist yet" when the backend says so — regardless of
 * whether it answers 404 (correct) or 400/500 with a "Driver ... not found" message.
 */
function isDriverNotFound(err: ApiError): boolean {
  if (err.status === 404) return true;
  if (err.errorCode === "DRIVER_NOT_FOUND") return true;
  const msg = String(err.message ?? "").toLowerCase();
  return msg.includes("driver") && msg.includes("not found");
}

export function useMyDriver() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setDriver(null);
    setNotFound(false);
    setError(null);
    setLoading(true);
    driversService
      .getMe()
      .then((d) => {
        setDriver(d);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err instanceof ApiError && isDriverNotFound(err)) {
          setNotFound(true);
          return;
        }
        setError(apiErrorMessage(err, "Erro ao carregar perfil de motorista"));
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { driver, setDriver, loading, notFound, error, refetch };
}
