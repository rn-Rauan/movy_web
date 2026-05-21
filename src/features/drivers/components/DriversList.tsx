import { EmptyState } from "@/components/feedback/EmptyState";
import { DriverCard } from "./DriverCard";
import type { Driver } from "@/lib/types";

type Props = {
  drivers: Driver[];
  onAdd: () => void;
  onRemove: (d: Driver) => void;
};

export function DriversList({ drivers, onAdd, onRemove }: Props) {
  if (drivers.length === 0) {
    return (
      <EmptyState
        variant="drivers"
        title="Nenhum motorista ainda"
        description="Adicione motoristas para que possam ser atribuídos às viagens."
        action={{ label: "Adicionar motorista", onClick: onAdd }}
      />
    );
  }
  return (
    <div className="space-y-2">
      {drivers.map((d) => (
        <DriverCard key={d.id} driver={d} onRemove={onRemove} />
      ))}
    </div>
  );
}
