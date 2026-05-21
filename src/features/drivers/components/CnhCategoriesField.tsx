import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CnhCategory } from "@/lib/types";

const ALL_CATEGORIES: CnhCategory[] = ["A", "B", "C", "D", "E"];

type Props = {
  value: CnhCategory[];
  onChange: (next: CnhCategory[]) => void;
  error?: string;
  disabled?: boolean;
};

export function CnhCategoriesField({ value, onChange, error, disabled }: Props) {
  function toggle(cat: CnhCategory, checked: boolean) {
    if (checked) {
      if (value.includes(cat)) return;
      onChange([...value, cat].sort());
    } else {
      onChange(value.filter((c) => c !== cat));
    }
  }

  return (
    <div className="space-y-1">
      <Label>Categorias</Label>
      <div className="grid grid-cols-5 gap-2">
        {ALL_CATEGORIES.map((cat) => {
          const checked = value.includes(cat);
          return (
            <label
              key={cat}
              className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
                checked ? "border-primary bg-primary/10" : "border-input"
              } ${disabled ? "opacity-50" : "cursor-pointer hover:bg-accent"}`}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(v) => toggle(cat, v === true)}
                disabled={disabled}
              />
              <span>{cat}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
