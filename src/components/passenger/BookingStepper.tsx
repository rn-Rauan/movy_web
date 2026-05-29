import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "done" | "active" | "todo";

type Step = { n: number; label: string };

type Props = {
  /** Currently active step (1-based). Steps below are "done", above are "todo". */
  current: number;
  steps: Step[];
  className?: string;
};

export function BookingStepper({ current, steps, className }: Props) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {steps.map((s, i) => {
        const state: StepState = s.n < current ? "done" : s.n === current ? "active" : "todo";
        const connectorAccent = s.n < current;
        return (
          <div key={s.n} className="contents">
            <StepDot state={state} n={s.n} label={s.label} />
            {i < steps.length - 1 && (
              <div className={cn("h-px flex-1", connectorAccent ? "bg-accent" : "bg-line")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepDot({ state, n, label }: { state: StepState; n: number; label: string }) {
  const dotClasses = {
    done: "border-accent bg-accent text-white",
    active: "border-ink bg-ink text-surface",
    todo: "border-line bg-surface text-muted-foreground",
  }[state];
  const labelClasses = {
    done: "text-ink-2",
    active: "text-ink",
    todo: "text-muted-foreground",
  }[state];
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] font-mono text-[10px] font-extrabold",
          dotClasses,
        )}
      >
        {state === "done" ? <Check className="h-[11px] w-[11px]" strokeWidth={3} /> : n}
      </div>
      <div className={cn("text-[9px] font-bold uppercase tracking-[0.2px]", labelClasses)}>
        {label}
      </div>
    </div>
  );
}
