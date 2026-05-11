import { useEffect, useState } from "react";
import { templatesService } from "@/services/templates.service";
import { driversService } from "@/services/drivers.service";
import { vehiclesService } from "@/services/vehicles.service";
import type { Driver, TripTemplate, Vehicle } from "@/lib/types";

export function useTripCreateOptions(orgId: string | null | undefined) {
  const [templates, setTemplates] = useState<TripTemplate[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!orgId) return;
    templatesService.listByOrgId(orgId).then((res) => {
      setTemplates(Array.isArray(res) ? res : (res.data ?? []));
    });
    driversService
      .listByOrgId(orgId)
      .then((res) => setDrivers(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
    vehiclesService
      .listByOrgId(orgId)
      .then((res) => setVehicles(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {});
  }, [orgId]);

  return { templates, drivers, vehicles };
}
