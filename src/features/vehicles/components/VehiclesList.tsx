import { EmptyState } from "@/components/feedback/EmptyState";
import { VehicleCard } from "./VehicleCard";
import type { Vehicle } from "@/lib/types";

type Props = {
  vehicles: Vehicle[];
  onAdd: () => void;
  onEdit: (v: Vehicle) => void;
  onRemove: (v: Vehicle) => void;
};

export function VehiclesList({ vehicles, onAdd, onEdit, onRemove }: Props) {
  const active = vehicles.filter((v) => v.status !== "INACTIVE");
  if (active.length === 0) {
    return (
      <EmptyState
        variant="trips"
        title="Nenhum veículo cadastrado"
        description="Cadastre veículos para atribuí-los às viagens da sua frota."
        action={{ label: "Adicionar veículo", onClick: onAdd }}
      />
    );
  }
  return (
    <div className="space-y-2">
      {active.map((v) => (
        <VehicleCard key={v.id} vehicle={v} onEdit={onEdit} onRemove={onRemove} />
      ))}
    </div>
  );
}
