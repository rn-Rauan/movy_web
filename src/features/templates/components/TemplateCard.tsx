import { CalendarPlus, Pencil, Trash2, Users, Bus } from "lucide-react";
import { utcHourToBr } from "@/lib/timezone";
import { useDriverName } from "@/features/drivers/hooks/useDriverName";
import { cn } from "@/lib/utils";
import type { TripTemplate, Weekday } from "@/lib/types";

const WEEKDAY_LABEL: Record<Weekday, string> = {
  SUNDAY: "Dom",
  MONDAY: "Seg",
  TUESDAY: "Ter",
  WEDNESDAY: "Qua",
  THURSDAY: "Qui",
  FRIDAY: "Sex",
  SATURDAY: "Sáb",
};

const WEEKDAY_ORDER: Weekday[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const WEEKDAYS_SET = new Set<Weekday>(WEEKDAY_ORDER);

/** Resumo legível da frequência: "Diário", "Seg–Sex", "Sáb/Dom", "Seg/Qua/Sex", "Pontual" etc. */
function frequencySummary(tpl: TripTemplate): string {
  if (!tpl.isRecurring) return "Pontual";
  const freq = (tpl.frequency ?? []).filter((d): d is Weekday => WEEKDAYS_SET.has(d));
  if (freq.length === 0) return "Pontual";
  if (freq.length === 7) return "Diário";
  const set = new Set(freq);
  const weekdays: Weekday[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const weekend: Weekday[] = ["SATURDAY", "SUNDAY"];
  if (freq.length === 5 && weekdays.every((d) => set.has(d))) return "Seg–Sex";
  if (freq.length === 2 && weekend.every((d) => set.has(d))) return "Sáb/Dom";
  return WEEKDAY_ORDER.filter((d) => set.has(d))
    .map((d) => WEEKDAY_LABEL[d])
    .join("/");
}

type Props = {
  template: TripTemplate;
  onEdit: (tpl: TripTemplate) => void;
  onDelete: (tpl: TripTemplate) => void;
  onGenerate?: (tpl: TripTemplate) => void;
};

export function TemplateCard({ template: tpl, onEdit, onDelete, onGenerate }: Props) {
  const { name: driverName } = useDriverName(tpl.defaultDriverId);

  const canGenerate =
    Boolean(onGenerate) && tpl.isRecurring === true && (tpl.status ?? "ACTIVE") === "ACTIVE";

  const departureBr = utcHourToBr(tpl.departureTimeOfDay);
  const hasSchedule = Boolean(departureBr);
  const isActive = (tpl.status ?? "ACTIVE") === "ACTIVE";

  const scheduleParts = [frequencySummary(tpl)];
  if (hasSchedule) scheduleParts.push(departureBr!);
  const schedule = scheduleParts.join(" · ");

  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-extrabold tracking-[-0.2px] text-ink">
            {tpl.departurePoint} → {tpl.destination}
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">{schedule}</div>
        </div>
        <span
          className={cn(
            "flex-none rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.3px]",
            isActive ? "bg-success-soft text-success" : "bg-line-soft text-muted-foreground",
          )}
        >
          {isActive ? "ATIVO" : "PAUSADO"}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2.5 text-[12px] text-ink-2">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" strokeWidth={1.8} />
          {tpl.defaultCapacity ?? "—"} vagas
        </span>
        <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground" />
        <span className="inline-flex min-w-0 items-center gap-1">
          <Bus className="h-3 w-3 flex-none" strokeWidth={1.8} />
          <span className="truncate">
            {tpl.defaultDriverId ? (driverName ?? "Carregando…") : "Sem motorista padrão"}
          </span>
        </span>
      </div>

      {(tpl.isPublic || (tpl.defaultDriverId && tpl.defaultVehicleId) || !hasSchedule) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {tpl.defaultDriverId && tpl.defaultVehicleId && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.2px] text-accent">
              Auto-publica
            </span>
          )}
          {tpl.isPublic && (
            <span className="rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.2px] text-info">
              Público
            </span>
          )}
          {!hasSchedule && (
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.2px] text-danger">
              Sem horário
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end gap-1 border-t border-line-soft pt-2.5">
        {canGenerate && (
          <button
            onClick={() => onGenerate?.(tpl)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition hover:bg-line-soft"
            title="Gerar viagens agora"
            aria-label="Gerar viagens"
          >
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        )}
        <button
          onClick={() => onEdit(tpl)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition hover:bg-line-soft"
          title="Editar template"
          aria-label="Editar"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => onDelete(tpl)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-danger-soft hover:text-danger"
          title="Excluir template"
          aria-label="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
