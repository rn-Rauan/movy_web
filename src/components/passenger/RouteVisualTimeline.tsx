import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Endpoint = {
  name: string;
  address?: string;
  time?: string;
  /** Append a "· chegada estimada" suffix next to the time */
  estimatedArrival?: boolean;
};

type Props = {
  origin: Endpoint;
  destination: Endpoint;
  className?: string;
};

export function RouteVisualTimeline({ origin, destination, className }: Props) {
  return (
    <div className={cn("grid grid-cols-[20px_1fr] gap-2.5", className)}>
      <div className="relative pt-[5px]">
        <span className="block h-[9px] w-[9px] rounded-full border-2 border-ink bg-surface" />
        <span className="absolute left-1 top-4 bottom-1.5 border-l-2 border-dashed border-line" />
        <span className="absolute bottom-0 left-0 block h-[9px] w-[9px] rounded-full bg-accent" />
      </div>
      <div>
        <Block ep={origin} />
        <div className="h-3.5" />
        <Block ep={destination} />
      </div>
    </div>
  );
}

function Block({ ep }: { ep: Endpoint }) {
  return (
    <div>
      <div className="text-[15px] font-extrabold tracking-[-0.3px] text-ink">{ep.name}</div>
      {ep.address && <div className="mt-0.5 text-[12px] text-muted-foreground">{ep.address}</div>}
      {ep.time && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink-2">
            <Clock className="h-[11px] w-[11px] text-muted-foreground" strokeWidth={1.6} />
            <span className="font-mono">{ep.time}</span>
          </span>
          {ep.estimatedArrival && (
            <span className="text-[11px] font-semibold text-muted-foreground">
              · chegada estimada
            </span>
          )}
        </div>
      )}
    </div>
  );
}
