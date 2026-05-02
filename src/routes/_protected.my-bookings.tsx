import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { bookingsService } from "@/services/bookings.service";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket } from "lucide-react";
import { BookingCard } from "@/components/domain/BookingCard";
import type { Booking } from "@/lib/types";

export const Route = createFileRoute("/_protected/my-bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const [items, setItems] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bookingsService
      .listForUser()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setItems(list);
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, []);

  return (
    <AppShell title="Minhas inscrições">
      {items === null && !error ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      ) : items && items.length === 0 ? (
        <Card className="p-8 text-center">
          <Ticket className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Você ainda não tem inscrições.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items!.map((b) => (
            <li key={b.id}>
              <Link to="/_protected/my-bookings/$bookingId" params={{ bookingId: b.id }} className="block">
                <BookingCard booking={b} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
