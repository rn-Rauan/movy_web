import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDateTime,
  formatPrice,
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusVariant,
} from "@/lib/format";
import type { Payment } from "@/lib/types";

export function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{formatPrice(payment.amount)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {formatDateTime(payment.createdAt)} · {paymentMethodLabel(payment.method)}
          </div>
        </div>
        <Badge variant={paymentStatusVariant(payment.status)} className="text-xs shrink-0">
          {paymentStatusLabel(payment.status)}
        </Badge>
      </div>
    </Card>
  );
}
