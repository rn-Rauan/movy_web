import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { BookingDetails } from "@/lib/types";
import {
  bookingStatusLabel,
  enrollmentTypeLabel,
  formatDateTime,
  formatFullDate,
  statusLabel,
  statusVariant,
} from "@/lib/format";
import { Calendar, MapPin, CreditCard, Hash, Users, Clock } from "lucide-react";

interface BookingDetailViewProps {
  booking: BookingDetails;
  onCancel: () => void;
  cancelling: boolean;
}

export function BookingDetailView({ booking, onCancel, cancelling }: BookingDetailViewProps) {
  const isActive = booking.status === "ACTIVE";
  const departure = booking.tripDepartureTime || booking.enrollmentDate;

  return (
    <>
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Data da viagem</p>
            <p className="font-semibold capitalize">{formatFullDate(departure)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={isActive ? "default" : "destructive"}>
              {bookingStatusLabel(booking.status)}
            </Badge>
            {booking.tripStatus ? (
              <Badge variant={statusVariant(booking.tripStatus)}>
                {statusLabel(booking.tripStatus)}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <Row icon={<Calendar className="h-4 w-4" />} label="Saída">
            {formatDateTime(departure, true)}
          </Row>
          {booking.tripArrivalEstimate ? (
            <Row icon={<Clock className="h-4 w-4" />} label="Chegada">
              {formatDateTime(booking.tripArrivalEstimate, true)}
            </Row>
          ) : null}
          <Row icon={<MapPin className="h-4 w-4" />} label="Embarque">
            {booking.boardingStop}
          </Row>
          <Row icon={<MapPin className="h-4 w-4" />} label="Desembarque">
            {booking.alightingStop}
          </Row>
          <Row icon={<Hash className="h-4 w-4" />} label="Tipo">
            {enrollmentTypeLabel(booking.enrollmentType)}
          </Row>
          {booking.availableSlots != null && booking.totalCapacity != null ? (
            <Row icon={<Users className="h-4 w-4" />} label="Vagas">
              {booking.availableSlots} de {booking.totalCapacity}
            </Row>
          ) : null}
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
            <Button variant="destructive" className="w-full h-12 text-base" disabled={cancelling}>
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
              <AlertDialogAction onClick={onCancel}>Cancelar inscrição</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
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
