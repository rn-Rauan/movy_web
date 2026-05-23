import { api } from "@/lib/api";
import type { TripSchedulingConfig } from "@/lib/types";

type SchedulingConfigPatch = Partial<{
  daysAhead: number;
  enabled: boolean;
}>;

export const schedulingService = {
  getConfig: (orgId: string) =>
    api<TripSchedulingConfig>(`/organizations/${orgId}/scheduling-config`),

  updateConfig: (orgId: string, patch: SchedulingConfigPatch) =>
    api<TripSchedulingConfig>(`/organizations/${orgId}/scheduling-config`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};
