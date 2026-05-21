import { useEffect, useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingList } from "@/components/feedback/LoadingList";
import { useSchedulingConfig } from "@/features/scheduling/hooks/useSchedulingConfig";
import { handleApiError } from "@/lib/handle-error";
import { schedulingService } from "@/services/scheduling.service";
import { brHourToUtc, utcHourToBr, HHMM_REGEX } from "@/lib/timezone";
import { cn } from "@/lib/utils";

type Props = {
  orgId: string | null;
};

/** Parse a `M H * * *` daily cron into HH:mm UTC. Returns null for non-daily patterns. */
function dailyCronToUtcHhmm(cron: string): string | null {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [m, h, dom, mon, dow] = parts;
  if (dom !== "*" || mon !== "*" || dow !== "*") return null;
  const minute = Number(m);
  const hour = Number(h);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function utcHhmmToDailyCron(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${m} ${h} * * *`;
}

type AutoCancelOption = {
  value: string;
  label: string;
  /** Versão curta pro resumo colapsado. */
  short: string;
  cron: string;
};

const AUTO_CANCEL_OPTIONS: AutoCancelOption[] = [
  { value: "5m", label: "A cada 5 minutos", short: "a cada 5min", cron: "*/5 * * * *" },
  {
    value: "15m",
    label: "A cada 15 minutos (recomendado)",
    short: "a cada 15min",
    cron: "*/15 * * * *",
  },
  { value: "30m", label: "A cada 30 minutos", short: "a cada 30min", cron: "*/30 * * * *" },
  { value: "1h", label: "A cada 1 hora", short: "a cada 1h", cron: "0 * * * *" },
  { value: "2h", label: "A cada 2 horas", short: "a cada 2h", cron: "0 */2 * * *" },
  { value: "6h", label: "A cada 6 horas", short: "a cada 6h", cron: "0 */6 * * *" },
  { value: "12h", label: "A cada 12 horas", short: "a cada 12h", cron: "0 */12 * * *" },
  { value: "24h", label: "Uma vez por dia", short: "1×/dia", cron: "0 0 * * *" },
];

function autoCancelCronToOption(cron: string): string | null {
  const normalized = cron.trim().replace(/\s+/g, " ");
  const match = AUTO_CANCEL_OPTIONS.find((o) => o.cron === normalized);
  return match ? match.value : null;
}

export function SchedulingConfigCard({ orgId }: Props) {
  const { config, setConfig, loading, notFound, error } = useSchedulingConfig(orgId);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [daysAhead, setDaysAhead] = useState<string>("");
  const [generationTimeBr, setGenerationTimeBr] = useState<string>("");
  const [autoCancelOption, setAutoCancelOption] = useState<string>("15m");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setDaysAhead(String(config.daysAhead));
      const utcHhmm = dailyCronToUtcHhmm(config.generationCron);
      setGenerationTimeBr(utcHhmm ? (utcHourToBr(utcHhmm) ?? "") : "");
      const opt = autoCancelCronToOption(config.autoCancelCron);
      if (opt) setAutoCancelOption(opt);
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

  const savedTimeBr = (() => {
    const utc = dailyCronToUtcHhmm(config.generationCron);
    return utc ? (utcHourToBr(utc) ?? "") : "";
  })();
  const isCustomGenerationCron = dailyCronToUtcHhmm(config.generationCron) === null;
  const savedAutoCancelOption = autoCancelCronToOption(config.autoCancelCron);
  const isCustomAutoCancelCron = savedAutoCancelOption === null;
  const selectedAutoCancelCron =
    AUTO_CANCEL_OPTIONS.find((o) => o.value === autoCancelOption)?.cron ?? config.autoCancelCron;
  const summaryAutoCancel =
    AUTO_CANCEL_OPTIONS.find((o) => o.value === (savedAutoCancelOption ?? autoCancelOption))
      ?.short ?? "personalizado";

  const dirty =
    enabled !== config.enabled ||
    daysAhead !== String(config.daysAhead) ||
    (!isCustomGenerationCron && generationTimeBr !== savedTimeBr) ||
    (!isCustomAutoCancelCron && selectedAutoCancelCron !== config.autoCancelCron);

  async function handleSave() {
    if (!orgId || !config) return;
    const days = Number(daysAhead);
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      toast.error("Janela de geração deve estar entre 1 e 90 dias");
      return;
    }
    if (!isCustomGenerationCron && !HHMM_REGEX.test(generationTimeBr)) {
      toast.error("Informe um horário válido (HH:mm)");
      return;
    }
    const patch: Record<string, unknown> = {};
    if (enabled !== config.enabled) patch.enabled = enabled;
    if (days !== config.daysAhead) patch.daysAhead = days;
    if (!isCustomGenerationCron && generationTimeBr !== savedTimeBr) {
      const utc = brHourToUtc(generationTimeBr);
      if (!utc) {
        toast.error("Horário inválido");
        return;
      }
      patch.generationCron = utcHhmmToDailyCron(utc);
    }
    if (!isCustomAutoCancelCron && selectedAutoCancelCron !== config.autoCancelCron) {
      patch.autoCancelCron = selectedAutoCancelCron;
    }
    setSubmitting(true);
    try {
      const updated = await schedulingService.updateConfig(orgId, patch);
      setConfig(updated);
      toast.success("Agendamento atualizado");
    } catch (err) {
      handleApiError(err, "Erro ao salvar configuração");
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
                    · {config.daysAhead} dias · {savedTimeBr || "—"} · {summaryAutoCancel}
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

              {isCustomGenerationCron ? (
                <FieldBlock
                  label="Horário de criação diária"
                  hint="Configurado pelo suporte. Para alterar, contate-nos."
                >
                  <div className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 font-mono text-[12px] text-muted-foreground">
                    {config.generationCron}
                  </div>
                </FieldBlock>
              ) : (
                <FieldBlock
                  label="Horário de criação diária"
                  hint="Todo dia neste horário (Brasília), o sistema gera as próximas viagens."
                >
                  <Input
                    type="time"
                    className="font-mono"
                    value={generationTimeBr}
                    onChange={(e) => setGenerationTimeBr(e.target.value)}
                  />
                </FieldBlock>
              )}

              {isCustomAutoCancelCron ? (
                <FieldBlock
                  label="Verificação de cancelamento"
                  hint="Configurada pelo suporte. Para alterar, contate-nos."
                >
                  <div className="rounded-xl border border-line bg-surface-2 px-3 py-2.5 font-mono text-[12px] text-muted-foreground">
                    {config.autoCancelCron}
                  </div>
                </FieldBlock>
              ) : (
                <FieldBlock
                  label="Verificação de cancelamento"
                  hint="Frequência com que o sistema verifica viagens sem inscritos suficientes."
                >
                  <Select value={autoCancelOption} onValueChange={setAutoCancelOption}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTO_CANCEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldBlock>
              )}
            </>
          )}

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
