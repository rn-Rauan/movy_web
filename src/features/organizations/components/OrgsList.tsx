import { CompanyCard } from "./CompanyCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Organization } from "@/lib/types";

interface OrgsListProps {
  orgs: Organization[];
}

export function OrgsList({ orgs }: OrgsListProps) {
  if (orgs.length === 0) {
    return (
      <EmptyState
        variant="search"
        title="Nenhuma empresa encontrada"
        description="Ainda não há empresas ativas para exibir."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {orgs.map((org) => (
        <li key={org.id}>
          <CompanyCard org={org} />
        </li>
      ))}
    </ul>
  );
}
