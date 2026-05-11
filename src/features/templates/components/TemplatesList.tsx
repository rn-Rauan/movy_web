import { EmptyState } from "@/components/feedback/EmptyState";
import { TemplateCard } from "./TemplateCard";
import type { TripTemplate } from "@/lib/types";

type Props = {
  templates: TripTemplate[];
  onCreate: () => void;
  onEdit: (tpl: TripTemplate) => void;
  onDelete: (tpl: TripTemplate) => void;
};

export function TemplatesList({ templates, onCreate, onEdit, onDelete }: Props) {
  if (templates.length === 0) {
    return (
      <EmptyState
        variant="templates"
        title="Nenhum template criado"
        description="Templates definem rotas reutilizáveis para gerar viagens rapidamente."
        action={{ label: "Criar template", onClick: onCreate }}
      />
    );
  }
  return (
    <div className="space-y-2">
      {templates.map((tpl) => (
        <TemplateCard key={tpl.id} template={tpl} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}