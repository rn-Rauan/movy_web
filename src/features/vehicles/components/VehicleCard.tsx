import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/types";

export const VEHICLE_TYPE_LABEL: Record<string, string> = {
  VAN: "Van",
  BUS: "Ônibus",
  MINIBUS: "Micro-ônibus",
  CAR: "Carro",
};

type Props = {
  vehicle: Vehicle;
  onEdit: (v: Vehicle) => void;
  onRemove: (v: Vehicle) => void;
};

export function VehicleCard({ vehicle: v, onEdit, onRemove }: Props) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{v.model}</div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
            <span>{v.plate}</span>
            <span>·</span>
            <span>{VEHICLE_TYPE_LABEL[v.type] ?? v.type}</span>
            <span>·</span>
            <span>{v.maxCapacity} lugares</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(v)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onRemove(v)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
