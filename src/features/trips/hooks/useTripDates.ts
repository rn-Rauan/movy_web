import { useEffect, useState } from "react";
import { tripsService } from "@/services/trips.service";
import type { Paginated, TripInstance } from "@/lib/types";

export type TripDate = { id: string; departureTime: string };

type Options = {
  organizationId?: string;
  templateId?: string | null;
  /** Só busca quando habilitado (ex.: depois que o trip carregou). */
  enabled?: boolean;
};

/**
 * Lista as próximas saídas da mesma rota (mesmo `tripTemplateId` na org), pra permitir que o
 * passageiro escolha a data no detalhe. Viagens recorrentes geram uma instância por dia — o
 * marketplace agrupa por rota, e aqui recuperamos as instâncias irmãs sob demanda.
 */
export function useTripDates({ organizationId, templateId, enabled = true }: Options): TripDate[] {
  const [dates, setDates] = useState<TripDate[]>([]);

  useEffect(() => {
    if (!enabled || !organizationId || !templateId) {
      setDates([]);
      return;
    }
    let cancelled = false;
    (tripsService.listPublic({ organizationId, limit: 100 }) as Promise<Paginated<TripInstance>>)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res.data ?? []);
        const siblings = list
          .filter((t) => t.tripTemplateId === templateId)
          .map((t) => ({ id: t.id, departureTime: t.departureTime }))
          .sort(
            (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
          );
        setDates(siblings);
      })
      .catch(() => {
        /* datas alternativas são opcionais — falha silenciosa */
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId, templateId, enabled]);

  return dates;
}
