import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { handleApiError } from "@/lib/handle-error";
import { paymentsService } from "@/services/payments.service";
import type { Paginated, Payment } from "@/lib/types";

const PAGE_SIZE = 20;

export function usePayments(orgId: string | null | undefined) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (pageNum: number) => {
      if (!orgId) return;
      if (pageNum > 1) setLoadingMore(true);
      try {
        const res = await paymentsService.list(orgId, pageNum, PAGE_SIZE);
        const list = Array.isArray(res) ? res : ((res as Paginated<Payment>).data ?? []);
        const total = Array.isArray(res) ? null : ((res as Paginated<Payment>).total ?? null);
        setPayments((prev) => {
          const next = pageNum === 1 ? list : [...(prev ?? []), ...list];
          setHasMore(total != null ? next.length < total : list.length === PAGE_SIZE);
          return next;
        });
        setPage(pageNum);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          if (pageNum === 1) setPayments([]);
          setHasMore(false);
        } else if (pageNum === 1) {
          setError(err instanceof Error ? err.message : "Erro ao carregar pagamentos");
        } else {
          handleApiError(err, "Erro ao carregar pagamentos");
        }
      } finally {
        setLoadingMore(false);
      }
    },
    [orgId],
  );

  useEffect(() => {
    if (!orgId) return;
    setPayments(null);
    setError(null);
    setPage(1);
    setHasMore(false);
    loadPage(1);
  }, [orgId, loadPage]);

  return {
    payments,
    loading: payments === null && !error,
    error,
    page,
    hasMore,
    loadingMore,
    loadMore: () => loadPage(page + 1),
  };
}