import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateVariant =
  | "trips"
  | "bookings"
  | "drivers"
  | "templates"
  | "payments"
  | "search";

type ActionTo = { label: string; to: string; onClick?: never };
type ActionClick = { label: string; onClick: () => void; to?: never };
type Action = ActionTo | ActionClick;

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  description?: string;
  action?: Action;
  className?: string;
}

export function EmptyState({ variant, title, description, action, className }: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "p-8 flex flex-col items-center text-center gap-3 border-dashed bg-card/50",
        className,
      )}
    >
      <Illustration variant={variant} />
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
        ) : null}
      </div>
      {action ? (
        action.to ? (
          <Button asChild size="sm" className="mt-1">
            <Link to={action.to}>{action.label}</Link>
          </Button>
        ) : (
          <Button size="sm" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </Card>
  );
}

function Illustration({ variant }: { variant: EmptyStateVariant }) {
  const common = "w-32 h-32 text-primary";
  const stroke = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (variant) {
    case "trips":
      return (
        <svg viewBox="0 0 128 128" className={common} aria-hidden="true">
          <circle cx="64" cy="64" r="52" className="text-primary/10" fill="currentColor" />
          <path {...stroke} d="M28 80h72M40 80V56l8-16h32l8 16v24" />
          <circle {...stroke} cx="46" cy="86" r="6" />
          <circle {...stroke} cx="82" cy="86" r="6" />
          <path {...stroke} d="M46 56h36" />
          <path {...stroke} className="text-foreground/40" d="M22 48l6-4M106 48l-6-4" />
        </svg>
      );
    case "bookings":
      return (
        <svg viewBox="0 0 128 128" className={common} aria-hidden="true">
          <circle cx="64" cy="64" r="52" className="text-primary/10" fill="currentColor" />
          <path
            {...stroke}
            d="M36 44h56a4 4 0 014 4v12a8 8 0 000 16v12a4 4 0 01-4 4H36a4 4 0 01-4-4V76a8 8 0 000-16V48a4 4 0 014-4z"
          />
          <path {...stroke} strokeDasharray="2 4" d="M64 48v32" />
          <circle cx="64" cy="64" r="3" fill="currentColor" />
        </svg>
      );
    case "drivers":
      return (
        <svg viewBox="0 0 128 128" className={common} aria-hidden="true">
          <circle cx="64" cy="64" r="52" className="text-primary/10" fill="currentColor" />
          <circle {...stroke} cx="64" cy="54" r="14" />
          <path {...stroke} d="M36 100c4-14 16-22 28-22s24 8 28 22" />
          <path {...stroke} className="text-foreground/40" d="M88 36l6-6M40 36l-6-6" />
        </svg>
      );
    case "templates":
      return (
        <svg viewBox="0 0 128 128" className={common} aria-hidden="true">
          <circle cx="64" cy="64" r="52" className="text-primary/10" fill="currentColor" />
          <rect {...stroke} x="36" y="32" width="48" height="64" rx="4" />
          <path {...stroke} d="M44 48h32M44 60h32M44 72h20" />
          <path {...stroke} className="text-foreground/40" d="M84 84l12 12M88 96h8v-8" />
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 128 128" className={common} aria-hidden="true">
          <circle cx="64" cy="64" r="52" className="text-primary/10" fill="currentColor" />
          <rect {...stroke} x="28" y="44" width="72" height="44" rx="6" />
          <path {...stroke} d="M28 58h72" />
          <path {...stroke} className="text-foreground/40" d="M40 76h16M68 76h8" />
        </svg>
      );
    case "search":
    default:
      return (
        <svg viewBox="0 0 128 128" className={common} aria-hidden="true">
          <circle cx="64" cy="64" r="52" className="text-primary/10" fill="currentColor" />
          <circle {...stroke} cx="58" cy="58" r="20" />
          <path {...stroke} d="M74 74l16 16" />
          <path {...stroke} className="text-foreground/40" d="M50 58h16M58 50v16" />
        </svg>
      );
  }
}