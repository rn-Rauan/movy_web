import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight, Ticket } from "lucide-react";
import type { Booking } from "@/lib/types";
import { bookingStatusLabel, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/my-bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api<Booking[] | { data: Booking[] }>("/bookings/user")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data ?? []);
        setItems(list);
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }, [isAuthenticated]);

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
              <Link to="/my-bookings/$bookingId" params={{ bookingId: b.id }} className="block">
                <Card className="p-4 active:bg-accent transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDateTime(b.enrollmentDate)}
                    </div>
                    <Badge variant={b.status === "ACTIVE" ? "default" : "destructive"}>
                      {bookingStatusLabel(b.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {b.boardingStop} → {b.alightingStop}
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
