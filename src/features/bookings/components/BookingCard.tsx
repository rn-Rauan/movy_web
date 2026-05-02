import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight } from "lucide-react";
import type { Booking } from "@/lib/types";
import { bookingStatusLabel, formatDateTime } from "@/lib/format";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Card className="p-4 active:bg-accent transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4 text-primary" />
          {formatDateTime(booking.enrollmentDate)}
        </div>
        <Badge variant={booking.status === "ACTIVE" ? "default" : "destructive"}>
          {bookingStatusLabel(booking.status)}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {booking.boardingStop} → {booking.alightingStop}
        </span>
        <ChevronRight className="h-5 w-5" />
      </div>
    </Card>
  );
}
