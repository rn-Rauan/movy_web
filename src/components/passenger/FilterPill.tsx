import { cn } from "@/lib/utils";

export type FilterPillOption<T extends string = string> = {
  value: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function FilterPillRow<T extends string>({ options, value, onChange, className }: Props<T>) {
  return (
    <div
      className={cn(
        "-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
              "flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] transition-colors",
              active
                ? "border-0 bg-ink font-bold text-surface"
                : "border border-line bg-surface font-medium text-ink-2 hover:text-ink",
            )}
          >
            {opt.label}
            {opt.count != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px font-mono text-[10px] font-bold",
                  active ? "bg-white/15 text-white" : "bg-line-soft text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
