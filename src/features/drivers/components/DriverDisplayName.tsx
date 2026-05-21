import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import type { Driver } from "@/lib/types";

/**
 * Renderiza o nome legível do motorista. Prefere `userName`/`userEmail` quando vêm no payload
 * (alguns endpoints já trazem); cai pra `GET /drivers/{id}/name` (cacheado) caso contrário,
 * e só mostra "Motorista" como último recurso.
 */
export function DriverDisplayName({
  driver,
  fallback,
}: {
  driver: Driver;
  /** Texto exibido quando não conseguimos resolver o nome. Default: "Motorista". */
  fallback?: string;
}) {
  const inline = driver.userName?.trim() || driver.userEmail?.trim();
  const { name: fetched, loading } = useDriverName(inline ? null : driver.id);
  const display = inline || fetched || (loading ? "Carregando..." : (fallback ?? "Motorista"));
  return <>{display}</>;
}
