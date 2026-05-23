import { useEffect, useState } from "react";
import { paymentsService } from "@/services/payments.service";
import { ApiError } from "@/lib/api";
import { paymentBucketDate } from "@/lib/format";
import { addBrMonths, isoToBrYmd, startOfBrMonth } from "@/lib/timezone";
import type { Paginated, Payment } from "@/lib/types";

type Result = {
  /** Soma de payments com status CONFIRMED no mês BR corrente. */
  confirmed: number;
  /** Soma de payments com status PENDING no mês BR corrente. */
  pending: number;
  /** Soma de payments com status FAILED no mês BR corrente. */
  lost: number;
  /** Payments do mês BR corrente — disponibilizados pra agregação adicional. */
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

async function fetchAllPayments(orgId: string): Promise<Payment[]> {
  const out: Payment[] = [];
  const size = 100;
  for (let page = 1; page <= 20; page++) {
    const res = await paymentsService.list(orgId, page, size);
    const list = Array.isArray(res) ? res : (res.data ?? []);
    out.push(...list);
    const meta = !Array.isArray(res) ? (res as Paginated<Payment>) : null;
    if (!meta || list.length < size || (meta.totalPages && page >= meta.totalPages)) break;
  }
  return out;
}

/**
 * Receita do mês BR corrente — confirmados, pendentes e perdidos.
 * Pagina `paymentsService.list` e filtra pelo mês BR atual. Tolerante a 403/404
 * (caso o user não tenha permissão de listar payments — devolve tudo 0).
 */
export function useOrgRevenue(orgId: string | null | undefined): Result {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAllPayments(orgId)
      .then((all) => {
        if (cancelled) return;
        const monthStart = startOfBrMonth();
        const monthEnd = addBrMonths(monthStart, 1);
        const startYmd = isoToBrYmd(monthStart);
        const endYmd = isoToBrYmd(monthEnd);
        const inMonth = all.filter((p) => {
          // Filtra pelo dia da viagem quando disponível, senão pelo createdAt
          const bucketIso = paymentBucketDate(p);
          if (!bucketIso) return false;
          const ymd = isoToBrYmd(bucketIso);
          return ymd >= startYmd && ymd < endYmd;
        });
        setPayments(inMonth);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          setPayments([]);
          return;
        }
        setError(err instanceof Error ? err.message : "Erro ao carregar receita");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, refreshKey]);

  // Re-busca quando a aba volta a ficar visível — cobre o caso de confirmar
  // pagamento em outra tela/aba e voltar pro dashboard sem navegar.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") setRefreshKey((k) => k + 1);
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  let confirmed = 0;
  let pending = 0;
  let lost = 0;
  for (const p of payments) {
    if (p.status === "COMPLETED") confirmed += p.amount;
    else if (p.status === "PENDING") pending += p.amount;
    else if (p.status === "FAILED") lost += p.amount;
  }

  return {
    confirmed,
    pending,
    lost,
    payments,
    loading,
    error,
    refetch: () => setRefreshKey((k) => k + 1),
  };
}
