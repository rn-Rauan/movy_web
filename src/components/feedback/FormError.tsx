import { AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { apiErrorMessage, isPlanLimitError } from "@/lib/handle-error";

type Props = {
  /** Error message to show. When falsy the component renders nothing. */
  children?: React.ReactNode;
  /** Optional trailing action (e.g. a "Ver planos" link). */
  action?: React.ReactNode;
  className?: string;
};

/**
 * Inline error banner shown above form fields (or at the top of a dialog/sheet body).
 * This is the standard surface for submission/API errors — use instead of a toast so the
 * message stays visible next to the inputs. Renders nothing when there is no message.
 */
export function FormError({ children, action, className }: Props) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-[12px] font-medium text-danger ${className ?? ""}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <div className="flex-1">
        {children}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}

/**
 * Convenience banner that takes a raw caught error, maps it to PT-BR copy via `apiErrorMessage`,
 * and — when it's a plan-limit 403 — appends a "Ver planos" link. Store the raw error in state
 * (`useState<unknown>`) and pass it here. Renders nothing when `error` is falsy.
 */
export function FormApiError({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null;
  const planLimit = isPlanLimitError(error);
  return (
    <FormError
      className={className}
      action={
        planLimit ? (
          <Link to="/organization" className="font-bold underline">
            Ver planos
          </Link>
        ) : undefined
      }
    >
      {apiErrorMessage(error)}
    </FormError>
  );
}
