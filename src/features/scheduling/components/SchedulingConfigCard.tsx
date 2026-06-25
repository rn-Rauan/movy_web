import { useEffect, useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingList } from "@/components/feedback/LoadingList";
import { FormError, FormApiError } from "@/components/feedback/FormError";
import { useSchedulingConfig } from "@/features/scheduling/hooks/useSchedulingConfig";
import { schedulingService } from "@/services/scheduling.service";
import { cn } from "@/lib/utils";

type Props = {
  orgId: string | null;
};

/**
 * Horários do cron global do backend (não configuráveis por org):
 * - Geração: 02:00 UTC todo dia = 23:00 BR do dia anterior.
 * - Auto-cancel: a cada 15 minutos UTC.
 */
const GENERATION_TIME_BR = "23:00";
const AUTO_CANCEL_LABEL = "a cada 15min";

export function SchedulingConfigCard({ orgId }: Props) {
  const { config, setConfig, loading, notFound, error } = useSchedulingConfig(orgId);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [daysAhead, setDaysAhead] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setDaysAhead(String(config.daysAhead));
    }
  }, [config]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4">
        <LoadingList count={1} height="h-12" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-line-soft text-muted-foreground">
            <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
          </div>
          <div>
            <h3 className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">
              Agendamento automático
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Esta organização ainda não tem configuração de agendamento. Contate o suporte para
              habilitar o recurso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return null;
  }

  const dirty = enabled !== config.enabled || daysAhead !== String(config.daysAhead);

  async function handleSave() {
    if (!orgId || !config) return;
    setValidationError(null);
    setSubmitError(null);
    const days = Number(daysAhead);
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      setValidationError("Janela de geração deve estar entre 1 e 90 dias");
      return;
    }
    const patch: Record<string, unknown> = {};
    if (enabled !== config.enabled) patch.enabled = enabled;
    if (days !== config.daysAhead) patch.daysAhead = days;
    setSubmitting(true);
    try {
      const updated = await schedulingService.updateConfig(orgId, patch);
      setConfig(updated);
      toast.success("Agendamento atualizado");
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition hover:bg-surface-2"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 flex-none items-center justify-center rounded-lg transition",
              config.enabled ? "bg-accent-soft text-accent" : "bg-line-soft text-muted-foreground",
            )}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">
              Agendamento automático
            </div>
            <div className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">
              {config.enabled ? (
                <>
                  <span className="font-bold text-success">● Ativo</span>{" "}
                  <span className="font-mono">
                    · {config.daysAhead} dias · {GENERATION_TIME_BR} · {AUTO_CANCEL_LABEL}
                  </span>
                </>
              ) : (
                <>Desativado · clique pra configurar</>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-none items-center gap-2.5">
          <span onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={enabled}
              onCheckedChange={(v) => {
                setEnabled(v);
                if (v && !open) setOpen(true);
              }}
            />
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            strokeWidth={1.8}
          />
        </div>
      </button>

      {open && (
        <div className="space-y-3.5 border-t border-line-soft px-3.5 pt-3.5 pb-3.5">
          {!enabled && (
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Ative o agendamento automático no toggle acima pra criar viagens recorrentes a partir
              dos seus templates e cancelar viagens sem inscritos suficientes.
            </p>
          )}

          {enabled && (
            <>
              <FieldBlock
                label="Antecedência"
                hint="Cria viagens com esta antecedência (1–90 dias)"
              >
                <Input
                  type="number"
                  min="1"
                  max="90"
                  step="1"
                  className="font-mono"
                  value={daysAhead}
                  onChange={(e) => setDaysAhead(e.target.value)}
                />
              </FieldBlock>

              <div className="rounded-xl border border-line-soft bg-surface-2 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-bold text-ink-2">Geração:</span> todo dia às{" "}
                  <span className="font-mono">{GENERATION_TIME_BR}</span> (horário de Brasília).
                </p>
                <p className="mt-1">
                  <span className="font-bold text-ink-2">Verificação de cancelamento:</span>{" "}
                  {AUTO_CANCEL_LABEL}.
                </p>
              </div>
            </>
          )}

          <FormError>{validationError}</FormError>
          <FormApiError error={submitError} />

          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleSave} disabled={!dirty || submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-bold uppercase tracking-[0.2px] text-ink-2">{label}</Label>
      {children}
      {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}
