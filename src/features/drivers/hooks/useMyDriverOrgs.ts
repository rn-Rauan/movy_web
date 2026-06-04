import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Organization, Paginated } from "@/lib/types";

type MembershipRole = { id: number; name: string };

/**
 * Lista as organizações em que o usuário tem vínculo de role `DRIVER`.
 *
 * Não há endpoint dedicado no backend — reaproveitamos o mesmo padrão do
 * `RoleContext`: `/organizations/me` traz todas as orgs do usuário e
 * `/memberships/me/role/{orgId}` resolve o role em cada uma. Mantemos só as `DRIVER`.
 *
 * @param enabled - quando false, não dispara as chamadas (ex.: user sem perfil de motorista)
 */
export function useMyDriverOrgs(enabled = true) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setOrgs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await api<Paginated<Organization>>("/organizations/me");
        const all = res.data ?? [];

        const roleResults = await Promise.allSettled(
          all.map((org) =>
            api<MembershipRole>(`/memberships/me/role/${org.id}`).then((role) => ({ org, role })),
          ),
        );

        const driverOrgs = roleResults
          .filter(
            (r): r is PromiseFulfilledResult<{ org: Organization; role: MembershipRole }> =>
              r.status === "fulfilled" && r.value.role.name === "DRIVER",
          )
          .map((r) => r.value.org);

        if (!cancelled) setOrgs(driverOrgs);
      } catch {
        if (!cancelled) setOrgs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { orgs, loading };
}
