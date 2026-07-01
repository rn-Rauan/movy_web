import { Clock, DollarSign, Hash, User, Users } from "lucide-react";
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
import { FormError } from "@/components/feedback/FormError";
import {
  bookingStatusLabel,
  enrollmentTypeLabel,
  formatDateTime,
  formatFullDate,
  formatPrice,
  isTripTerminal,
  statusLabel,
} from "@/lib/format";
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import { StatusPill } from "@/components/passenger/StatusPill";
import { RouteVisualTimeline } from "@/components/passenger/RouteVisualTimeline";
import { MetadataRow, type MetadataItem } from "@/components/passenger/MetadataRow";

interface BookingDetailViewProps {
  booking: BookingDetails;
  onCancel: () => void;
  cancelling: boolean;
  cancelError?: string | null;
}

export function BookingDetailView({
  booking,
  onCancel,
  cancelling,
  cancelError,
}: BookingDetailViewProps) {
  const isActive = booking.status === "ACTIVE";
  // Só é possível cancelar a inscrição enquanto a viagem não está em estado terminal
  // (em curso, concluída ou cancelada). Isso impede cancelar inscrição de viagem cancelada.
  const tripTerminal = isTripTerminal(booking.tripStatus);
  const canCancel = isActive && !tripTerminal;
  const departure = booking.tripDepartureTime || booking.enrollmentDate;
  const { name: driverName } = useDriverName(booking.tripInstance?.driverId);

  const meta: MetadataItem[] = [
    {
      label: "Tipo",
      value: enrollmentTypeLabel(booking.enrollmentType),
      icon: <Hash className="h-3 w-3" strokeWidth={1.6} />,
    },
  ];
  if (booking.availableSlots != null && booking.totalCapacity != null) {
    meta.push({
      label: "Vagas",
      value: `${booking.availableSlots}/${booking.totalCapacity}`,
      icon: <Users className="h-3 w-3" strokeWidth={1.6} />,
    });
  }
  if (booking.recordedPrice != null) {
    meta.push({
      label: "Valor",
      value: formatPrice(booking.recordedPrice),
      icon: <DollarSign className="h-3 w-3" strokeWidth={1.6} />,
      strong: true,
    });
  }

  return (
    <>
      <article className="mb-3 rounded-2xl border border-line bg-surface p-4">
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
              Data da viagem
            </div>
            <div className="mt-1 text-balance text-[17px] font-extrabold capitalize tracking-[-0.4px] text-ink">
              {formatFullDate(departure)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusPill status={booking.status} />
            {booking.tripStatus && <StatusPill status={booking.tripStatus} />}
          </div>
        </header>

        <RouteVisualTimeline
          origin={{
            name: booking.boardingStop,
            time: formatDateTime(departure, true),
          }}
          destination={{
            name: booking.alightingStop,
            time: booking.tripArrivalEstimate
              ? formatDateTime(booking.tripArrivalEstimate, true)
              : undefined,
            estimatedArrival: !!booking.tripArrivalEstimate,
          }}
          className="mt-3.5"
        />

        <div className="mt-3.5 border-t border-dashed border-line pt-3">
          <MetadataRow items={meta} />
        </div>

        {driverName && (
          <div className="mt-3 flex items-center gap-2 border-t border-dashed border-line pt-3 text-[12px] text-muted-foreground">
            <User className="h-3.5 w-3.5" strokeWidth={1.6} />
            Motorista: <span className="font-semibold text-ink-2">{driverName}</span>
          </div>
        )}

        {booking.tripArrivalEstimate == null && (
          <div className="mt-3 flex items-center gap-2 border-t border-dashed border-line pt-3 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.6} />
            Horário de chegada será confirmado próximo à viagem.
          </div>
        )}
      </article>

      <FormError className="mb-3">{cancelError}</FormError>

      {isActive && tripTerminal && (
        <div className="mb-3 rounded-[12px] border border-line bg-line-soft px-4 py-3 text-[12px] text-muted-foreground">
          {booking.tripStatus === "CANCELED"
            ? "Esta viagem foi cancelada. Não há ação disponível para esta inscrição."
            : `Esta viagem está ${statusLabel(booking.tripStatus ?? "").toLowerCase()}. O cancelamento da inscrição não está mais disponível.`}
        </div>
      )}

      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="h-12 w-full rounded-[12px] bg-danger text-[14px] font-bold text-white hover:bg-danger/90"
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
              <AlertDialogAction onClick={onCancel}>Cancelar inscrição</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
