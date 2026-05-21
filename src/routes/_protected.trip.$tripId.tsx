import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useAdminTripDetail } from "@/features/trips/hooks/useAdminTripDetail";
import { AdminTripDetailView } from "@/features/trips/components/AdminTripDetailView";

export const Route = createFileRoute("/_protected/trip/$tripId")({
  component: TripDetailPage,
});

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const { isAdmin, isDriver, adminOrgId, roleLoading } = useRole();

  const orgId = isAdmin ? adminOrgId : null;
  const role = isAdmin ? "admin" : isDriver ? "driver" : null;

  const {
    trip,
    error,
    passengers,
    bookings,
    drivers,
    vehicles,
    transitioning,
    assigningDriver,
    assigningVehicle,
    busyBookingId,
    transitionStatus,
    assignDriver,
    assignVehicle,
    confirmPresence,
    cancelBooking,
  } = useAdminTripDetail(tripId, orgId, { role });

  if (!roleLoading && !isAdmin && !isDriver) {
    return <Navigate to="/" />;
  }

  return (
    <AppShell title="Detalhe da viagem" back>
      {error ? (
        <ErrorCard message={error} />
      ) : !trip || !role ? (
        <LoadingList count={3} height="h-24" />
      ) : (
        <AdminTripDetailView
          role={role}
          trip={trip}
          passengers={passengers}
          bookings={bookings}
          drivers={drivers}
          vehicles={vehicles}
          transitioning={transitioning}
          assigningDriver={assigningDriver}
          assigningVehicle={assigningVehicle}
          busyBookingId={busyBookingId}
          onTransition={transitionStatus}
          onAssignDriver={assignDriver}
          onAssignVehicle={assignVehicle}
          onConfirmPresence={confirmPresence}
          onCancelBooking={cancelBooking}
        />
      )}
    </AppShell>
  );
}
