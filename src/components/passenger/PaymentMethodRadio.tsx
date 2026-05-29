import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentOption<T extends string = string> = {
  value: T;
  label: string;
  sub?: string;
  icon?: ReactNode;
};

type Props<T extends string> = {
  options: PaymentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
};

export function PaymentMethodRadio<T extends string>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-2.5 rounded-[12px] border-[1.5px] px-3 py-[11px] text-left transition-colors",
              selected
                ? "border-accent bg-accent-soft"
                : "border-line bg-surface hover:border-ink-2",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 flex-none items-center justify-center rounded-lg border",
                selected
                  ? "border-line bg-surface text-accent"
                  : "border-line bg-surface-2 text-ink-2",
              )}
            >
              {opt.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-ink">{opt.label}</span>
              {opt.sub && (
                <span className="mt-px block text-[11px] text-muted-foreground">{opt.sub}</span>
              )}
            </span>
            <span
              className={cn(
                "flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2",
                selected ? "border-accent bg-accent" : "border-line bg-transparent",
              )}
            >
              {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
