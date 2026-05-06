import { toast } from "sonner";
import { ApiError } from "./api";

export function handleApiError(err: unknown, fallbackMsg: string) {
  if (err instanceof ApiError && err.status === 403) {
    const data = err.data as { message?: string } | null;
    const msg = String(data?.message ?? err.message ?? "").toLowerCase();
    if (msg.includes("plan") || msg.includes("limit") || msg.includes("excedido")) {
      toast.error("Você atingiu o limite do seu plano", {
        action: {
          label: "Ver planos",
          onClick: () => window.location.assign("/organization"),
        },
      });
      return;
    }
  }
  toast.error(err instanceof Error ? err.message : fallbackMsg);
}