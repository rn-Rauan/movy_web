import { Link } from "@tanstack/react-router";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import type { Organization } from "@/lib/types";

type Props = {
  org: Organization & { city?: string; rating?: number };
  /** Where the secondary outline action navigates (default "Ver viagens" on the org's public page). */
  primaryHref?: string;
};

export function CompanyCard({ org, primaryHref }: Props) {
  const initial = (org.name ?? "?").charAt(0).toUpperCase();
  const tripsHref = `/public/organizations/${org.slug}`;
  const contactHref = org.email
    ? `mailto:${org.email}`
    : org.telephone
      ? `tel:${org.telephone}`
      : undefined;

  return (
    <div className="rounded-[14px] border border-line bg-surface p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-line bg-surface-2 text-[15px] font-extrabold text-ink">
          {org.name ? initial : <Building2 className="h-5 w-5 text-ink-2" strokeWidth={1.6} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[16px] font-extrabold tracking-[-0.2px] text-ink">
              {org.name}
            </h3>
            {org.rating != null && (
              <span className="text-[11px] font-bold text-ink-2">
                <span className="text-warning">★</span> {org.rating.toFixed(1)}
              </span>
            )}
          </div>
          {(org.city ?? org.address) && (
            <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
              <MapPin className="h-3 w-3" strokeWidth={1.6} />
              <span className="truncate">{org.city ?? org.address}</span>
            </div>
          )}
        </div>
      </div>

      {(org.email || org.telephone) && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[12px] text-muted-foreground">
          {org.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 flex-none" strokeWidth={1.6} />
              <span className="truncate">{org.email}</span>
            </div>
          )}
          {org.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 flex-none" strokeWidth={1.6} />
              <span>{org.telephone}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          to={primaryHref ?? tripsHref}
          className="flex h-10 items-center justify-center rounded-[10px] border border-line bg-surface text-[12px] font-bold text-ink hover:bg-line-soft"
        >
          Ver viagens
        </Link>
        {contactHref ? (
          <a
            href={contactHref}
            className="flex h-10 items-center justify-center rounded-[10px] bg-ink text-[12px] font-bold text-surface hover:bg-ink/90"
          >
            Contato
          </a>
        ) : (
          <span className="flex h-10 items-center justify-center rounded-[10px] border border-line bg-surface-2 text-[12px] font-bold text-muted-foreground">
            Sem contato
          </span>
        )}
      </div>
    </div>
  );
}
