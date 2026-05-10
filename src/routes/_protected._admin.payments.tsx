import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { paymentsService } from "@/services/payments.service";
import { useRole } from "@/lib/role-context";
import { ApiError } from "@/lib/api";
import { handleApiError } from "@/lib/handle-error";
import {
  formatDateTime,
  formatPrice,
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusVariant,
} from "@/lib/format";
import type { Payment, Paginated } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/payments")({
  component: PaymentsPage,
});

const PAGE_SIZE = 20;

function PaymentsPage() {
  const { adminOrgId } = useRole();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPage(pageNum: number) {
    if (!adminOrgId) return;
    if (pageNum > 1) setLoadingMore(true);
    try {
      const res = await paymentsService.list(adminOrgId, pageNum, PAGE_SIZE);
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
  }

  useEffect(() => {
    if (!adminOrgId) return;
    setPayments(null);
    setError(null);
    setPage(1);
    setHasMore(false);
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOrgId]);

  return (
    <AppShell title="Pagamentos" back>
      {error ? (
        <ErrorCard message={error} />
      ) : payments === null ? (
        <LoadingList count={5} height="h-20" />
      ) : payments.length === 0 ? (
        <Card className="p-8 text-center">
          <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum pagamento ainda.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              disabled={loadingMore}
              onClick={() => loadPage(page + 1)}
            >
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </Button>
          )}
        </div>
      )}
    </AppShell>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{formatPrice(payment.amount)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {formatDateTime(payment.createdAt)} · {paymentMethodLabel(payment.method)}
          </div>
        </div>
        <Badge variant={paymentStatusVariant(payment.status)} className="text-xs shrink-0">
          {paymentStatusLabel(payment.status)}
        </Badge>
      </div>
    </Card>
  );
}
