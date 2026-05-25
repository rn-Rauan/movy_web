import { useEffect, useState } from "react";
import { paymentsService } from "@/services/payments.service";
import { ApiError } from "@/lib/api";
import { fetchAllPages } from "@/lib/paginate";
import { paymentBucketDate } from "@/lib/format";
import { addBrMonths, isoToBrYmd, startOfBrDay, startOfBrMonth } from "@/lib/timezone";
import type { Payment } from "@/lib/types";

type Result = {
  /** Soma de payments com status COMPLETED na janela (mês BR corrente + últimos 7 dias). */
  confirmed: number;
  /** Soma de payments com status PENDING na janela (mês BR corrente + últimos 7 dias). */
  pending: number;
  /** Soma de payments com status FAILED na janela (mês BR corrente + últimos 7 dias). */
  lost: number;
  /** Payments da janela (mês BR corrente + últimos 7 dias) — disponibilizados pra agregação adicional. */
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

function fetchAllPayments(orgId: string): Promise<Payment[]> {
  return fetchAllPages((page, limit) => paymentsService.list(orgId, page, limit));
}

/**
 * Receita do mês BR corrente mais os últimos 7 dias — confirmados, pendentes e perdidos.
 * A janela é ampliada além do início do mês pra cobrir o mini-chart de 7 dias do dashboard
 * mesmo na virada de mês (ex: dias do mês anterior que caem nos últimos 7 dias).
 * Pagina `paymentsService.list` e filtra pela janela. Tolerante a 403/404
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
        // Janela = início do mês OU hoje−6 dias, o que vier primeiro (cobre o
        // mini-chart de 7 dias do dashboard na virada de mês). BR é UTC−3 fixo
        // (sem DST), então subtrair ms é seguro.
        const sevenDayStart = new Date(startOfBrDay().getTime() - 6 * 24 * 60 * 60 * 1000);
        const monthStartYmd = isoToBrYmd(monthStart);
        const sevenDayStartYmd = isoToBrYmd(sevenDayStart);
        const startYmd = sevenDayStartYmd < monthStartYmd ? sevenDayStartYmd : monthStartYmd;
        const endYmd = isoToBrYmd(monthEnd);
        const inWindow = all.filter((p) => {
          // Filtra pelo dia da viagem quando disponível, senão pelo createdAt
          const bucketIso = paymentBucketDate(p);
          if (!bucketIso) return false;
          const ymd = isoToBrYmd(bucketIso);
          return ymd >= startYmd && ymd < endYmd;
        });
        setPayments(inWindow);
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
