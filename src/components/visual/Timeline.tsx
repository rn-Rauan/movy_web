import { cn } from "@/lib/utils";

export type TimelineStop = {
  name: string;
  sub?: string;
  kind?: "start" | "stop" | "end";
};

export type TimelineProps = {
  from: string;
  to: string;
  departure?: string;
  arrival?: string;
  stops?: { name: string; sub?: string }[];
  className?: string;
};

export function Timeline({ from, to, departure, arrival, stops = [], className }: TimelineProps) {
  const items: TimelineStop[] = [
    { name: from, sub: departure ? `Partida · ${departure}` : "Partida", kind: "start" },
    ...stops.map((s) => ({ ...s, kind: "stop" as const })),
    { name: to, sub: arrival ? `Chegada · ${arrival}` : "Chegada", kind: "end" },
  ];

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-[9px] top-2.5 bottom-2.5 w-0 border-l-2 border-dashed border-line" />
      <div className="flex flex-col gap-3.5">
        {items.map((p, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className="flex w-5 flex-none items-center justify-center pt-0.5">
              {p.kind === "start" && (
                <div className="h-3 w-3 rounded-full border-[2.5px] border-ink bg-surface" />
              )}
              {p.kind === "end" && (
                <div className="h-3 w-3 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" />
              )}
              {p.kind === "stop" && (
                <div className="h-[7px] w-[7px] rounded-full bg-muted-foreground shadow-[0_0_0_3px_var(--surface)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "leading-tight text-ink tracking-[-0.2px]",
                  p.kind === "stop" ? "text-[13px] font-semibold" : "text-[15px] font-extrabold",
                )}
              >
                {p.name}
              </div>
              {p.sub && (
                <div
                  className={cn(
                    "mt-0.5 text-[11px] text-muted-foreground",
                    p.kind !== "stop" && "font-mono",
                  )}
                >
                  {p.sub}
                </div>
              )}
            </div>
            {p.kind === "start" && (
              <span className="self-center rounded-full bg-line-soft px-1.5 py-0.5 text-[10px] font-bold tracking-[0.3px] text-ink-2">
                ORIGEM
              </span>
            )}
            {p.kind === "end" && (
              <span className="self-center rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold tracking-[0.3px] text-accent">
                DESTINO
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
