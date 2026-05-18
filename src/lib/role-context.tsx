import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth-context";
import type { Organization, Paginated } from "./types";

type RoleContextValue = {
  isAdmin: boolean;
  isDriver: boolean;
  hasDriverProfile: boolean;
  adminOrgId: string | null;
  roleLoading: boolean;
  refetchRole: () => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [hasDriverProfile, setHasDriverProfile] = useState(false);
  const [adminOrgId, setAdminOrgId] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const detectRoles = useCallback(async () => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      setIsDriver(false);
      setHasDriverProfile(false);
      setAdminOrgId(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    try {
      const [driverResult, orgsResult] = await Promise.allSettled([
        api<{ id: string }>("/drivers/me"),
        api<Paginated<Organization>>("/organizations/me"),
      ]);

      setHasDriverProfile(driverResult.status === "fulfilled");

      const orgs = orgsResult.status === "fulfilled" ? (orgsResult.value.data ?? []) : [];

      if (orgs.length === 0) {
        setIsAdmin(false);
        setAdminOrgId(null);
        setIsDriver(false);
        return;
      }

      const roleResults = await Promise.allSettled(
        orgs.map((o) =>
          api<{ id: number; name: string }>(`/memberships/me/role/${o.id}`).then((role) => ({
            orgId: o.id,
            role,
          })),
        ),
      );

      let foundAdminOrg: string | null = null;
      let foundDriverMembership = false;
      for (const r of roleResults) {
        if (r.status !== "fulfilled") continue;
        if (!foundAdminOrg && r.value.role.name === "ADMIN") {
          foundAdminOrg = r.value.orgId;
        }
        if (r.value.role.name === "DRIVER") {
          foundDriverMembership = true;
        }
      }

      setIsAdmin(foundAdminOrg !== null);
      setAdminOrgId(foundAdminOrg);
      setIsDriver(driverResult.status === "fulfilled" && foundDriverMembership);
    } finally {
      setRoleLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) detectRoles();
  }, [authLoading, detectRoles]);

  return (
    <RoleContext.Provider
      value={{
        isAdmin,
        isDriver,
        hasDriverProfile,
        adminOrgId,
        roleLoading,
        refetchRole: detectRoles,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
