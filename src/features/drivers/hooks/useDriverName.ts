import { useEffect, useState } from "react";
import { driversService } from "@/services/drivers.service";
import { ApiError } from "@/lib/api";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export function useDriverName(driverId: string | null | undefined) {
  const [name, setName] = useState<string | null>(() =>
    driverId ? (cache.get(driverId) ?? null) : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!driverId) {
      setName(null);
      return;
    }
    const cached = cache.get(driverId);
    if (cached) {
      setName(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const existing = inflight.get(driverId);
    const promise =
      existing ??
      driversService
        .getName(driverId)
        .then((res) => {
          cache.set(driverId, res.name);
          return res.name;
        })
        .catch((err) => {
          if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
            return "";
          }
          throw err;
        })
        .finally(() => {
          inflight.delete(driverId);
        });
    if (!existing) inflight.set(driverId, promise);

    promise
      .then((value) => {
        if (!cancelled) setName(value || null);
      })
      .catch(() => {
        if (!cancelled) setName(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [driverId]);

  return { name, loading };
}
