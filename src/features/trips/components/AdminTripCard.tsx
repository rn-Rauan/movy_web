import { ChevronRight, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, statusLabel, statusVariant } from "@/lib/format";
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import type { TripInstance } from "@/lib/types";

export function AdminTripCard({ trip: t }: { trip: TripInstance }) {
  const { name: driverName } = useDriverName(t.driverId);

  return (
    <Link to="/trip/$tripId" params={{ tripId: t.id }} className="block">
      <Card className="p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-sm font-semibold">{formatDateTime(t.departureTime)}</div>
          <Badge variant={statusVariant(t.tripStatus)}>{statusLabel(t.tripStatus)}</Badge>
        </div>
        {(t.departurePoint || t.destination) && (
          <div className="text-sm text-muted-foreground mb-2">
            {t.departurePoint ?? "—"} → {t.destination ?? "—"}
          </div>
        )}
        {t.driverId && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <User className="h-3 w-3" />
            {driverName ?? "Carregando..."}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t.totalCapacity} lugares · {t.bookedCount ?? 0} inscritos
          </span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Card>
    </Link>
  );
}
