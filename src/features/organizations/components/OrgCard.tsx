import { Card } from "@/components/ui/card";
import { Building2, ChevronRight } from "lucide-react";
import type { Organization } from "@/lib/types";

interface OrgCardProps {
  org: Organization;
}

export function OrgCard({ org }: OrgCardProps) {
  return (
    <Card className="p-4 flex items-center gap-3 active:bg-accent transition-colors">
      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Building2 className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{org.name}</p>
        {org.address ? (
          <p className="text-xs text-muted-foreground truncate">{org.address}</p>
        ) : null}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Card>
  );
}
