import { Globe, Building2 } from "lucide-react";

type Props = {
  variant: "public" | "org";
  orgName?: string;
  slug?: string;
};

/** Small visual hint that tells the user which context they are browsing. */
export function ContextBanner({ variant, orgName, slug }: Props) {
  if (variant === "public") {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        <span>
          Você está navegando no <strong className="font-medium text-foreground">modo público</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground">
      <Building2 className="h-3.5 w-3.5 text-primary" />
      <span>
        Empresa: <strong className="font-medium">{orgName ?? slug}</strong>
        {slug ? <span className="text-muted-foreground"> · @{slug}</span> : null}
      </span>
    </div>
  );
}