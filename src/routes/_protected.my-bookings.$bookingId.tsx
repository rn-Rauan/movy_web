import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useBookingDetail } from "@/features/bookings/hooks/useBookingDetail";
import { BookingDetailView } from "@/features/bookings/components/BookingDetailView";

export const Route = createFileRoute("/_protected/my-bookings/$bookingId")({
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { bookingId } = Route.useParams();
  const { booking, loading, error, cancel, cancelling } = useBookingDetail(bookingId);

  function renderContent() {
    if (loading) return <LoadingList count={2} height="h-32" />;
    if (error) return <ErrorCard message={error} />;
    if (booking)
      return <BookingDetailView booking={booking} onCancel={cancel} cancelling={cancelling} />;
    return null;
  }

  return (
    <AppShell title="Inscrição" back>
      {renderContent()}
    </AppShell>
  );
}
