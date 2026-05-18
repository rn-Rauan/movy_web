import { CalendarPlus, MapPin, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { utcHourToBr } from "@/lib/timezone";
import type { TripTemplate } from "@/lib/types";

const SHIFT_LABEL: Record<string, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
};

type Props = {
  template: TripTemplate;
  onEdit: (tpl: TripTemplate) => void;
  onDelete: (tpl: TripTemplate) => void;
  onGenerate?: (tpl: TripTemplate) => void;
};

export function TemplateCard({ template: tpl, onEdit, onDelete, onGenerate }: Props) {
  const canGenerate =
    Boolean(onGenerate) && tpl.isRecurring === true && (tpl.status ?? "ACTIVE") === "ACTIVE";

  const departureBr = utcHourToBr(tpl.departureTimeOfDay);
  const arrivalBr = utcHourToBr(tpl.arrivalTimeOfDay);
  const hasSchedule = Boolean(departureBr && arrivalBr);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          {tpl.departurePoint} → {tpl.destination}
        </div>
        {tpl.isPublic ? (
          <Badge variant="default">Público</Badge>
        ) : (
          <Badge variant="outline">Privado</Badge>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {SHIFT_LABEL[tpl.shift] ?? tpl.shift}
          {hasSchedule && ` · ${departureBr}–${arrivalBr}`}
          {tpl.defaultCapacity != null && ` · ${tpl.defaultCapacity} assentos`}
          {` · ${tpl.stops?.length ?? 0} paradas`}
        </span>
        <div className="flex gap-1">
          {canGenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGenerate?.(tpl)}
              className="h-8 w-8 p-0"
              title="Gerar viagens agora"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(tpl)} className="h-8 w-8 p-0">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(tpl)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {!hasSchedule && (
        <p className="mt-2 text-xs text-destructive">
          Sem horário configurado — edite o template para usar geração automática.
        </p>
      )}
    </Card>
  );
}
