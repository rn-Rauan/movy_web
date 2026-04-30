import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Booking } from "@/lib/types";
import { bookingStatusLabel, formatDateTime, formatFullDate } from "@/lib/format";
import { Calendar, MapPin, CreditCard, Hash } from "lucide-react";

export const Route = createFileRoute("/my-bookings/$bookingId")({
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { bookingId } = Route.useParams();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  function load() {
    api<Booking>(`/bookings/${bookingId}`)
      .then(setBooking)
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      });
  }

  useEffect(() => {
    if (isAuthenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, isAuthenticated]);

  async function onCancel() {
    setCancelling(true);
    try {
      await api(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      toast.success("Inscrição cancelada.");
      load();
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao cancelar");
    } finally {
      setCancelling(false);
    }
  }

  if (error) {
    return (
      <AppShell title="Inscrição" back>
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell title="Inscrição" back>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  const isActive = booking.status === "ACTIVE";

  return (
    <AppShell title="Inscrição" back>
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Data da viagem
            </p>
            <p className="font-semibold capitalize">
              {formatFullDate(booking.enrollmentDate)}
            </p>
          </div>
          <Badge
            variant={
              isActive
                ? "default"
                : booking.status === "CANCELLED"
                  ? "destructive"
                  : "secondary"
            }
          >
            {bookingStatusLabel(booking.status)}
          </Badge>
        </div>

        <div className="space-y-3">
          <Row icon={<Calendar className="h-4 w-4" />} label="Horário">
            {formatDateTime(booking.enrollmentDate, true)}
          </Row>
          <Row icon={<MapPin className="h-4 w-4" />} label="Embarque">
            {booking.boardingStop}
          </Row>
          <Row icon={<MapPin className="h-4 w-4" />} label="Desembarque">
            {booking.alightingStop}
          </Row>
          <Row icon={<Hash className="h-4 w-4" />} label="Tipo">
            {booking.enrollmentType === "ONE_WAY" ? "Somente ida" : "Ida e volta"}
          </Row>
          {booking.recordedPrice != null ? (
            <Row icon={<CreditCard className="h-4 w-4" />} label="Valor">
              R$ {booking.recordedPrice.toFixed(2)}
            </Row>
          ) : null}
        </div>
      </Card>

      {isActive ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full h-12 text-base"
              disabled={cancelling}
            >
              {cancelling ? "Cancelando..." : "Cancelar inscrição"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar inscrição?</AlertDialogTitle>
              <AlertDialogDescription>
                Você não poderá desfazer esta ação. Sua vaga será liberada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={onCancel}>
                Cancelar inscrição
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </AppShell>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{children}</span>
    </div>
  );
}