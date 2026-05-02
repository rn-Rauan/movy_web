import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useBookings } from "@/features/bookings/hooks/useBookings";
import { BookingsList } from "@/features/bookings/components/BookingsList";

export const Route = createFileRoute("/_protected/my-bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { bookings, loading, error } = useBookings();

  return (
    <AppShell title="Minhas inscrições">
      {loading ? (
        <LoadingList count={2} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <BookingsList bookings={bookings ?? []} />
      )}
    </AppShell>
  );
}
