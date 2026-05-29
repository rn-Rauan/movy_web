import { cn } from "@/lib/utils";

export type SegmentOption<T extends string = string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentFilter<T extends string>({ options, value, onChange, className }: Props<T>) {
  return (
    <div
      className={cn(
        "flex gap-0.5 rounded-[10px] border border-line bg-surface-2 p-[3px]",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-[8px] px-1 py-1.5 text-[11px] transition-colors",
              active
                ? "bg-ink font-bold text-surface"
                : "bg-transparent font-semibold text-ink-2 hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
