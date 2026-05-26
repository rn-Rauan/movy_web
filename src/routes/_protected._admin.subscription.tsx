import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useSubscriptions } from "@/features/subscriptions/hooks/useSubscriptions";
import { SubscriptionsList } from "@/features/subscriptions/components/SubscriptionsList";

export const Route = createFileRoute("/_protected/_admin/subscription")({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { adminOrgId } = useRole();
  const { subscriptions, plans, loading, error } = useSubscriptions(adminOrgId);

  return (
    <AppShell title="Assinatura" back>
      {loading ? (
        <LoadingList count={4} height="h-24" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <SubscriptionsList subscriptions={subscriptions ?? []} plans={plans} />
      )}
    </AppShell>
  );
}
