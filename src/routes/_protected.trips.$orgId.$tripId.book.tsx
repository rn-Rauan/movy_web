import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowRight, Banknote, Calendar, CreditCard, Smartphone, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginRequired } from "@/components/feedback/LoginRequired";
import { useAuth } from "@/lib/auth-context";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useBookingForm } from "@/features/bookings/hooks/useBookingForm";
import { useUserBookingForTrip } from "@/features/bookings/hooks/useUserBookingForTrip";
import { formatDateTime, tripPriceFor } from "@/lib/format";
import { BookingStepper } from "@/components/passenger/BookingStepper";
import { PaymentMethodRadio, type PaymentOption } from "@/components/passenger/PaymentMethodRadio";
import type { EnrollmentType, PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_protected/trips/$orgId/$tripId/book")({
  component: BookPage,
});

const PAYMENT_OPTIONS: PaymentOption<PaymentMethod>[] = [
  {
    value: "PIX",
    label: "PIX",
    sub: "Aprovação na hora",
    icon: <Zap className="h-3.5 w-3.5" strokeWidth={1.6} />,
  },
  {
    value: "CREDIT_CARD",
    label: "Cartão de crédito",
    sub: "Até 3x sem juros",
    icon: <CreditCard className="h-3.5 w-3.5" strokeWidth={1.6} />,
  },
  {
    value: "DEBIT_CARD",
    label: "Cartão de débito",
    sub: "Débito direto",
    icon: <Smartphone className="h-3.5 w-3.5" strokeWidth={1.6} />,
  },
  {
    value: "MONEY",
    label: "Dinheiro na viagem",
    sub: "Pague ao embarcar",
    icon: <Banknote className="h-3.5 w-3.5" strokeWidth={1.6} />,
  },
];

function BookPage() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <AppShell title="Inscrição" back>
        <LoginRequired message="Entre na sua conta para reservar esta viagem." />
      </AppShell>
    );
  }
  return <BookContent />;
}

function BookContent() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const { trip } = useTripDetail(tripId, { authenticated: true });
  const { booking: existingBooking, loading: checkingExisting } = useUserBookingForTrip(tripId);
  const { form, setForm, prefill, submit, submitting } = useBookingForm(tripId);

  useEffect(() => {
    if (trip) prefill(trip);
  }, [trip, prefill]);

  useEffect(() => {
    if (existingBooking) {
      toast.info("Você já está inscrito nesta viagem.");
      navigate({
        to: "/my-bookings/$bookingId",
        params: { bookingId: existingBooking.id },
        replace: true,
      });
    }
  }, [existingBooking, navigate]);

  const price = trip ? tripPriceFor(trip, form.enrollmentType) : undefined;

  const stopOptions = useMemo(() => {
    if (!trip) return [];
    const all = [
      trip.departurePoint,
      ...(trip.template?.stops ?? trip.stops ?? []),
      trip.destination,
    ].filter((s): s is string => Boolean(s && s.trim()));
    return Array.from(new Set(all));
  }, [trip]);

  const enrollmentLabel: Record<EnrollmentType, string> = {
    ONE_WAY: "1 passageiro · Somente ida",
    RETURN: "1 passageiro · Somente volta",
    ROUND_TRIP: "1 passageiro · Ida e volta",
  };

  return (
    <AppShell title="Inscrição" back>
      <div className="pb-32">
        <BookingStepper
          className="mb-4"
          current={2}
          steps={[
            { n: 1, label: "Viagem" },
            { n: 2, label: "Inscrição" },
            { n: 3, label: "Pagar" },
          ]}
        />

        {trip && (
          <div className="mb-5 rounded-[14px] border border-accent-soft bg-accent-soft p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-accent">
              Viagem
            </div>
            <div className="mt-1 flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.3px] text-ink">
              <span>{trip.departurePoint}</span>
              <ArrowRight className="h-3.5 w-3.5 text-accent" strokeWidth={2.2} />
              <span>{trip.destination}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-[12px] font-semibold text-ink-2">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" strokeWidth={1.6} />
                <span className="font-mono font-bold">{formatDateTime(trip.departureTime)}</span>
              </span>
              {trip.organizationName && (
                <>
                  <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground" />
                  <span>{trip.organizationName}</span>
                </>
              )}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(trip);
          }}
          className="flex flex-col gap-3.5"
        >
          <FieldGroup label="Tipo de viagem">
            <Select
              value={form.enrollmentType}
              onValueChange={(v) => setForm((f) => ({ ...f, enrollmentType: v as EnrollmentType }))}
            >
              <SelectTrigger className="h-11 rounded-[11px] border-line bg-surface text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trip?.priceOneWay != null || !trip ? (
                  <SelectItem value="ONE_WAY">Somente ida</SelectItem>
                ) : null}
                {trip?.priceReturn != null ? (
                  <SelectItem value="RETURN">Somente volta</SelectItem>
                ) : null}
                {trip?.priceRoundTrip != null || !trip ? (
                  <SelectItem value="ROUND_TRIP">Ida e volta</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Parada de embarque">
            <Select
              value={form.boardingStop}
              onValueChange={(v) => setForm((f) => ({ ...f, boardingStop: v }))}
              disabled={stopOptions.length === 0}
            >
              <SelectTrigger className="h-11 rounded-[11px] border-line bg-surface text-[13px]">
                <SelectValue placeholder="Selecione onde você sobe" />
              </SelectTrigger>
              <SelectContent>
                {stopOptions.map((stop) => (
                  <SelectItem key={`b-${stop}`} value={stop} disabled={stop === form.alightingStop}>
                    {stop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Parada de desembarque">
            <Select
              value={form.alightingStop}
              onValueChange={(v) => setForm((f) => ({ ...f, alightingStop: v }))}
              disabled={stopOptions.length === 0}
            >
              <SelectTrigger className="h-11 rounded-[11px] border-line bg-surface text-[13px]">
                <SelectValue placeholder="Selecione onde você desce" />
              </SelectTrigger>
              <SelectContent>
                {stopOptions.map((stop) => (
                  <SelectItem key={`a-${stop}`} value={stop} disabled={stop === form.boardingStop}>
                    {stop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <div>
            <Label className="mb-2 block text-[11px] font-bold tracking-[0.1px] text-ink-2">
              Método de pagamento
            </Label>
            <PaymentMethodRadio
              options={PAYMENT_OPTIONS}
              value={form.method}
              onChange={(v) => setForm((f) => ({ ...f, method: v }))}
            />
          </div>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-[64px] z-10 border-t border-line bg-surface pb-[max(env(safe-area-inset-bottom),0px)]">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-ink-2">
            <span>{enrollmentLabel[form.enrollmentType]}</span>
            {price != null && (
              <span className="font-mono text-[14px] font-extrabold text-ink">
                R$ {price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
          <Button
            type="submit"
            onClick={() => submit(trip)}
            disabled={submitting || checkingExisting || Boolean(existingBooking)}
            className="h-12 w-full gap-2 rounded-[12px] bg-ink text-[14px] font-bold text-surface hover:bg-ink/90"
          >
            {submitting ? "Confirmando..." : "Confirmar inscrição"}
            {!submitting && <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold tracking-[0.1px] text-ink-2">
        {label}
      </Label>
      {children}
    </div>
  );
}
