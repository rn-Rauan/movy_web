import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { BookingCard } from "./BookingCard";
import type { Booking } from "@/lib/types";

interface BookingsListProps {
  bookings: Booking[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Ticket className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Você ainda não tem inscrições.</p>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li key={b.id}>
          <Link
            to="/_protected/my-bookings/$bookingId"
            params={{ bookingId: b.id }}
            className="block"
          >
            <BookingCard booking={b} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
