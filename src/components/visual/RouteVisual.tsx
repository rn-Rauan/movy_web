import { Bus } from "lucide-react";
import { cn } from "@/lib/utils";

export type RouteVisualProps = {
  from: string;
  to: string;
  big?: boolean;
  className?: string;
};

export function RouteVisual({ from, to, big = false, className }: RouteVisualProps) {
  return (
    <div
      className={cn(
        "grid w-full items-center gap-2.5",
        "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col items-start">
        <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
          Origem
        </div>
        <div
          className={cn("font-bold leading-tight text-ink", big ? "text-[17px]" : "text-[15px]")}
        >
          {from}
        </div>
      </div>

      <div className="flex items-center gap-1 px-1">
        <div className="h-[7px] w-[7px] flex-none rounded-full border-[1.8px] border-ink" />
        <div className="h-px w-6 flex-none border-t border-dashed border-line" />
        <Bus className="h-3.5 w-3.5 flex-none text-accent" strokeWidth={1.6} />
        <div className="h-px w-6 flex-none border-t border-dashed border-line" />
        <div className="h-[7px] w-[7px] flex-none rounded-full bg-accent" />
      </div>

      <div className="flex min-w-0 flex-col items-end">
        <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
          Destino
        </div>
        <div
          className={cn(
            "text-right font-bold leading-tight text-ink",
            big ? "text-[17px]" : "text-[15px]",
          )}
        >
          {to}
        </div>
      </div>
    </div>
  );
}
