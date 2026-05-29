import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = {
  current: "passenger" | "company";
  className?: string;
};

export function SignupAudienceToggle({ current, className }: Props) {
  return (
    <div
      className={cn(
        "mb-5 flex gap-[3px] rounded-[12px] border border-line bg-surface-2 p-[3px]",
        className,
      )}
    >
      <ToggleLink to="/signup" active={current === "passenger"} label="Sou passageiro" />
      <ToggleLink to="/signup/empresa" active={current === "company"} label="Tenho empresa" />
    </div>
  );
}

function ToggleLink({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link
      to={to as string}
      className={cn(
        "flex-1 rounded-[10px] py-2 text-center text-[12px] transition-colors",
        active
          ? "bg-surface font-bold text-ink shadow-sm"
          : "bg-transparent font-semibold text-ink-2 hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
