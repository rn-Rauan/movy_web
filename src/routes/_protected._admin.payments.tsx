import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { PaymentsList } from "@/features/payments/components/PaymentsList";

export const Route = createFileRoute("/_protected/_admin/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const { adminOrgId } = useRole();
  const { payments, loading, error, hasMore, loadingMore, loadMore } = usePayments(adminOrgId);

  return (
    <AppShell title="Pagamentos" back>
      {loading ? (
        <LoadingList count={5} height="h-20" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <PaymentsList
          payments={payments ?? []}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      )}
    </AppShell>
  );
}
