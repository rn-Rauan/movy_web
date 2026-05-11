import { EmptyState } from "@/components/feedback/EmptyState";
import { AdminTripCard } from "./AdminTripCard";
import type { TripInstance } from "@/lib/types";

type Props = {
  trips: TripInstance[];
  onCreate: () => void;
};

export function AdminTripsList({ trips, onCreate }: Props) {
  if (trips.length === 0) {
    return (
      <EmptyState
        variant="trips"
        title="Nenhuma viagem agendada"
        description="Crie sua primeira viagem a partir de um template para começar a receber reservas."
        action={{ label: "Criar viagem", onClick: onCreate }}
      />
    );
  }
  return (
    <div className="space-y-2">
      {trips.map((t) => (
        <AdminTripCard key={t.id} trip={t} />
      ))}
    </div>
  );
}