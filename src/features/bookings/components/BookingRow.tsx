import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronRight } from "lucide-react";
import type { Booking } from "@/lib/types";
import { bookingStatusLabel, enrollmentTypeLabel, paymentMethodLabel } from "@/lib/format";

interface BookingRowProps {
  booking: Booking;
  passengerName?: string;
  onConfirmPresence?: (id: string) => void;
  onCancel?: (id: string) => void;
  busy?: boolean;
}

export function BookingRow({
  booking,
  passengerName,
  onConfirmPresence,
  onCancel,
  busy,
}: BookingRowProps) {
  const isActive = booking.status === "ACTIVE";
  const showPresence = isActive && !booking.presenceConfirmed && !!onConfirmPresence;
  const showCancel = isActive && !!onCancel;

  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{passengerName ?? "Passageiro"}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <span className="truncate">{booking.boardingStop}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate">{booking.alightingStop}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={isActive ? "default" : "destructive"} className="text-xs">
            {bookingStatusLabel(booking.status)}
          </Badge>
          {booking.presenceConfirmed && (
            <Badge variant="secondary" className="text-xs">
              <Check className="h-3 w-3 mr-0.5" />
              Presente
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
        <span>{enrollmentTypeLabel(booking.enrollmentType)}</span>
        {booking.paymentMethod && (
          <>
            <span>·</span>
            <span>{paymentMethodLabel(booking.paymentMethod)}</span>
          </>
        )}
        {booking.recordedPrice != null && (
          <>
            <span>·</span>
            <span className="font-medium text-foreground">
              R$ {booking.recordedPrice.toFixed(2)}
            </span>
          </>
        )}
      </div>

      {(showPresence || showCancel) && (
        <div className="flex gap-2 pt-1">
          {showPresence && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs flex-1"
              onClick={() => onConfirmPresence?.(booking.id)}
              disabled={busy}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Marcar presença
            </Button>
          )}
          {showCancel && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive flex-1"
              onClick={() => onCancel?.(booking.id)}
              disabled={busy}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
