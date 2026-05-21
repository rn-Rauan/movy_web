import { cn } from "@/lib/utils";
import type { TripStatus, BookingStatus } from "@/lib/types";

type StatusKey = TripStatus | BookingStatus;

const STATUS_LABEL: Record<StatusKey, string> = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  FINISHED: "Finalizada",
  CANCELED: "Cancelada",
  ACTIVE: "Ativa",
  INACTIVE: "Inativa",
};

const STATUS_TONE: Record<StatusKey, "info" | "success" | "danger" | "muted" | "ink"> = {
  DRAFT: "muted",
  SCHEDULED: "info",
  CONFIRMED: "success",
  IN_PROGRESS: "success",
  FINISHED: "ink",
  CANCELED: "danger",
  ACTIVE: "success",
  INACTIVE: "muted",
};

const TONE_CLASS: Record<string, string> = {
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  muted: "bg-line-soft text-muted-foreground",
  ink: "bg-line-soft text-ink-2",
};

export type StatusPillProps = {
  status: StatusKey;
  label?: string;
  className?: string;
};

export function StatusPill({ status, label, className }: StatusPillProps) {
  const tone = STATUS_TONE[status] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.1px] whitespace-nowrap",
        TONE_CLASS[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? STATUS_LABEL[status] ?? status}
    </span>
  );
}
