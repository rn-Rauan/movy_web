import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import type { Organization } from "@/lib/types";

interface OrgCardProps {
  org: Organization;
}

/** Public org card — does NOT expose slug; shows name + contact info. */
export function OrgCard({ org }: OrgCardProps) {
  const contactHref = org.email ? `mailto:${org.email}` : org.telephone ? `tel:${org.telephone}` : undefined;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{org.name}</p>
          {org.address ? (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {org.address}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
        {org.email ? (
          <p className="flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{org.email}</span>
          </p>
        ) : null}
        {org.telephone ? (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {org.telephone}
          </p>
        ) : null}
      </div>

      {contactHref ? (
        <a href={contactHref} className="block mt-3" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" className="w-full h-10">
            Entrar em contato
          </Button>
        </a>
      ) : null}
    </Card>
  );
}
