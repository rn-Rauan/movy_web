import { Check, Clock, CircleDollarSign, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Booking, Payment } from "@/lib/types";
import { enrollmentTypeLabel, paymentMethodLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BookingRowProps {
  booking: Booking;
  passengerName?: string;
  payment?: Payment | null;
  onConfirmPresence?: (id: string) => void;
  onConfirmPayment?: (paymentId: string) => void;
  onCancel?: (id: string) => void;
  busy?: boolean;
}

function firstLetterOf(name?: string | null) {
  const ch = name?.trim().charAt(0);
  return ch ? ch.toUpperCase() : "—";
}

/** Chip de ação no estilo do protótipo. Verde quando "ativo" (confirmado, terminal e
 *  não-clicável); off-tone clicável quando a ação ainda está disponível. */
function ToggleChip({
  active,
  onClick,
  disabled,
  icon: Icon,
  label,
  offTone = "muted",
}: {
  active: boolean;
  onClick?: () => void;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  offTone?: "muted" | "warn" | "danger";
}) {
  const interactive = !!onClick && !disabled;
  const tone = active
    ? "border-transparent bg-success-soft text-success"
    : offTone === "warn"
      ? "border-transparent bg-warning-soft text-warning"
      : offTone === "danger"
        ? "border-transparent bg-danger-soft text-danger"
        : "border-line bg-surface text-muted-foreground";
  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-2 py-2.5 text-[12px] font-bold tracking-[-0.1px] transition",
        tone,
        interactive ? "cursor-pointer hover:opacity-90" : "cursor-default",
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      {label}
    </button>
  );
}

export function BookingRow({
  booking,
  passengerName,
  payment,
  onConfirmPresence,
  onConfirmPayment,
  onCancel,
  busy,
}: BookingRowProps) {
  const name = passengerName ?? "Passageiro";
  const initial = firstLetterOf(name);

  // Inscrição cancelada — card tracejado, nome riscado, sem ações (não há
  // endpoint de reativação no backend).
  if (booking.status !== "ACTIVE") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-line bg-surface-2 px-3 py-2.5">
        <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-line-soft text-[14px] font-extrabold text-muted-foreground">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-bold tracking-[-0.2px] text-muted-foreground line-through">
            {name}
          </div>
          <div className="mt-0.5 text-[11px] font-bold text-danger">Inscrição cancelada</div>
        </div>
      </div>
    );
  }

  const presenceConfirmed = booking.presenceConfirmed;
  const paymentStatus = payment?.status ?? null;
  const paid = paymentStatus === "COMPLETED";
  const allSet = presenceConfirmed && paid;
  const showCancel = !!onCancel;

  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-3 transition",
        allSet ? "border-success-soft" : "border-line",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-accent-soft text-[15px] font-extrabold tracking-[-0.5px] text-accent">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-extrabold tracking-[-0.2px] text-ink">
              {name}
            </span>
            {allSet && <Check className="h-3.5 w-3.5 flex-none text-success" strokeWidth={2.8} />}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {enrollmentTypeLabel(booking.enrollmentType)}
            {booking.paymentMethod && <> · {paymentMethodLabel(booking.paymentMethod)}</>}
            {booking.recordedPrice != null && (
              <>
                {" · "}
                <span className="font-mono font-bold text-ink-2">
                  R$ {booking.recordedPrice.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
        {showCancel && (
          <button
            type="button"
            onClick={() => onCancel?.(booking.id)}
            disabled={busy}
            title="Cancelar inscrição"
            className="flex flex-none p-1 text-muted-foreground transition hover:text-danger disabled:opacity-50"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="mt-2.5 flex gap-2">
        <ToggleChip
          active={presenceConfirmed}
          onClick={onConfirmPresence ? () => onConfirmPresence(booking.id) : undefined}
          disabled={busy}
          icon={presenceConfirmed ? Check : Clock}
          label={presenceConfirmed ? "Presente" : "Marcar presença"}
          offTone="muted"
        />
        <ToggleChip
          active={paid}
          onClick={
            paymentStatus === "PENDING" && payment && onConfirmPayment
              ? () => onConfirmPayment(payment.id)
              : undefined
          }
          disabled={busy}
          icon={CircleDollarSign}
          label={
            paid
              ? "Pago"
              : paymentStatus === "PENDING"
                ? "Pgto. pendente"
                : paymentStatus === "FAILED"
                  ? "Pgto. falhou"
                  : "Sem cobrança"
          }
          offTone={
            paymentStatus === "PENDING" ? "warn" : paymentStatus === "FAILED" ? "danger" : "muted"
          }
        />
      </div>
    </div>
  );
}
