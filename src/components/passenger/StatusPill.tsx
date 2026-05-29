import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "danger" | "muted" | "ink2";

const TONE_CLASSES: Record<Tone, { bg: string; text: string; dot: string }> = {
  info: { bg: "bg-info-soft", text: "text-info", dot: "bg-info" },
  success: { bg: "bg-success-soft", text: "text-success", dot: "bg-success" },
  danger: { bg: "bg-danger-soft", text: "text-danger", dot: "bg-danger" },
  muted: { bg: "bg-line-soft", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  ink2: { bg: "bg-line-soft", text: "text-ink-2", dot: "bg-ink-2" },
};

const STATUS_MAP: Record<string, { tone: Tone; label: string }> = {
  // TripStatus
  DRAFT: { tone: "muted", label: "Rascunho" },
  SCHEDULED: { tone: "info", label: "Agendada" },
  CONFIRMED: { tone: "success", label: "Confirmada" },
  IN_PROGRESS: { tone: "success", label: "Em curso" },
  FINISHED: { tone: "ink2", label: "Concluída" },
  CANCELED: { tone: "danger", label: "Cancelada" },
  // BookingStatus
  ACTIVE: { tone: "success", label: "Ativa" },
  INACTIVE: { tone: "danger", label: "Cancelada" },
};

type Props = {
  status: string;
  /** Override the auto-derived label */
  label?: string;
  /** Use transparent background instead of soft tint */
  ghost?: boolean;
  className?: string;
};

export function StatusPill({ status, label, ghost = false, className }: Props) {
  const meta = STATUS_MAP[status] ?? { tone: "info" as Tone, label: status };
  const tone = TONE_CLASSES[meta.tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px] text-[11px] font-semibold",
        ghost ? "bg-transparent" : tone.bg,
        tone.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {label ?? meta.label}
    </span>
  );
}
