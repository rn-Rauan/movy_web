import { BookingCard } from "./BookingCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Booking } from "@/lib/types";

interface BookingsListProps {
  bookings: Booking[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        variant="bookings"
        title="Nenhuma inscrição ainda"
        description="Quando você reservar uma viagem, ela aparece aqui."
        action={{ label: "Explorar viagens", to: "/public/trip-instances" }}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {bookings.map((b) => (
        <li key={b.id}>
          <BookingCard booking={b} />
        </li>
      ))}
    </ul>
  );
}
