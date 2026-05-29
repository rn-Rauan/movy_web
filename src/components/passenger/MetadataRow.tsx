import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MetadataItem = {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Use bigger, monospace value (e.g. for price) */
  strong?: boolean;
};

type Props = {
  items: MetadataItem[];
  className?: string;
};

export function MetadataRow({ items, className }: Props) {
  return (
    <div
      className={cn(
        "grid gap-1.5",
        items.length === 3 && "grid-cols-3",
        items.length === 2 && "grid-cols-2",
        items.length === 4 && "grid-cols-4",
        className,
      )}
    >
      {items.map((m) => (
        <div key={m.label}>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
            {m.icon}
            {m.label}
          </div>
          <div
            className={cn(
              "mt-0.5 font-extrabold tracking-[-0.3px] text-ink",
              m.strong ? "font-mono text-[16px]" : "text-[13px]",
            )}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}
