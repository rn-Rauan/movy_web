import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { OrgCard } from "./OrgCard";
import type { Organization } from "@/lib/types";

interface OrgsListProps {
  orgs: Organization[];
}

export function OrgsList({ orgs }: OrgsListProps) {
  if (orgs.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Nenhuma empresa ativa no momento.
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {orgs.map((org) => (
        <li key={org.id}>
          <Link
            to="/_protected/trips/$orgId"
            params={{ orgId: org.id }}
            search={{ slug: org.slug }}
            className="block"
          >
            <OrgCard org={org} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
