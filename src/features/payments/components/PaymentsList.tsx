import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentRow } from "./PaymentRow";
import type { Payment } from "@/lib/types";

type Props = {
  payments: Payment[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

export function PaymentsList({ payments, hasMore, loadingMore, onLoadMore }: Props) {
  if (payments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum pagamento ainda.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {payments.map((p) => (
        <PaymentRow key={p.id} payment={p} />
      ))}
      {hasMore && (
        <Button variant="outline" className="w-full" disabled={loadingMore} onClick={onLoadMore}>
          {loadingMore ? "Carregando..." : "Carregar mais"}
        </Button>
      )}
    </div>
  );
}
