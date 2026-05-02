import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth-context";
import type { Organization, Paginated } from "./types";

type RoleContextValue = {
  isAdmin: boolean;
  isDriver: boolean;
  adminOrgId: string | null;
  roleLoading: boolean;
  refetchRole: () => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [adminOrgId, setAdminOrgId] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const detectRoles = useCallback(async () => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      setIsDriver(false);
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

      setIsDriver(driverResult.status === "fulfilled");

      if (orgsResult.status === "fulfilled") {
        const orgs = orgsResult.value.data ?? [];
        if (orgs.length > 0) {
          const orgId = orgs[0].id;
          try {
            const role = await api<{ id: number; name: string }>(
              `/memberships/me/role/${orgId}`,
            );
            if (role.name === "ADMIN") {
              setIsAdmin(true);
              setAdminOrgId(orgId);
            } else {
              setIsAdmin(false);
              setAdminOrgId(null);
            }
          } catch {
            setIsAdmin(false);
            setAdminOrgId(null);
          }
        } else {
          setIsAdmin(false);
          setAdminOrgId(null);
        }
      } else {
        setIsAdmin(false);
        setAdminOrgId(null);
      }
    } finally {
      setRoleLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) detectRoles();
  }, [authLoading, detectRoles]);

  return (
    <RoleContext.Provider
      value={{ isAdmin, isDriver, adminOrgId, roleLoading, refetchRole: detectRoles }}
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
