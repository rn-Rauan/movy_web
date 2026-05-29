import { Bus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  from: string;
  to: string;
  className?: string;
};

export function RouteVisualHorizontal({ from, to, className }: Props) {
  return (
    <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-2.5", className)}>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
          Origem
        </div>
        <div className="mt-0.5 truncate text-[14px] font-extrabold tracking-[-0.2px] text-ink">
          {from}
        </div>
      </div>
      <div className="flex min-w-[60px] items-center gap-1 px-1">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full border-[1.6px] border-ink" />
        <span className="flex-1 border-t-[1.5px] border-dashed border-line" />
        <Bus className="h-3 w-3 shrink-0 text-accent" strokeWidth={1.6} />
        <span className="flex-1 border-t-[1.5px] border-dashed border-line" />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      </div>
      <div className="min-w-0 text-right">
        <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
          Destino
        </div>
        <div className="mt-0.5 truncate text-[14px] font-extrabold tracking-[-0.2px] text-ink">
          {to}
        </div>
      </div>
    </div>
  );
}
