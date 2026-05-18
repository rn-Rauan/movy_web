import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
  cron: string;
};

const AUTO_CANCEL_OPTIONS: AutoCancelOption[] = [
  { value: "5m", label: "A cada 5 minutos", cron: "*/5 * * * *" },
  { value: "15m", label: "A cada 15 minutos (recomendado)", cron: "*/15 * * * *" },
  { value: "30m", label: "A cada 30 minutos", cron: "*/30 * * * *" },
  { value: "1h", label: "A cada 1 hora", cron: "0 * * * *" },
  { value: "2h", label: "A cada 2 horas", cron: "0 */2 * * *" },
  { value: "6h", label: "A cada 6 horas", cron: "0 */6 * * *" },
  { value: "12h", label: "A cada 12 horas", cron: "0 */12 * * *" },
  { value: "24h", label: "Uma vez por dia", cron: "0 0 * * *" },
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
      <Card className="p-5 mb-4">
        <LoadingList count={1} height="h-16" />
      </Card>
    );
  }

  if (notFound) {
    return (
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-3">
          <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="text-base font-semibold">Agendamento automático</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Esta organização ainda não tem configuração de agendamento. Contate o suporte para
              habilitar o recurso.
            </p>
          </div>
        </div>
      </Card>
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
    <Card className="p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Agendamento automático</h3>
            <p className="text-xs text-muted-foreground">
              Cria viagens recorrentes e cancela viagens sem inscrições suficientes.
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Criar viagens com quantos dias de antecedência?</Label>
          <Input
            type="number"
            min="1"
            max="90"
            step="1"
            value={daysAhead}
            onChange={(e) => setDaysAhead(e.target.value)}
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground">
            Entre 1 e 90 dias. Exemplo: 14 dias cria viagens para as próximas duas semanas.
          </p>
        </div>

        {isCustomGenerationCron ? (
          <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
            Horário de geração personalizado configurado pelo suporte (
            <code className="font-mono">{config.generationCron}</code>). Para alterar, contate o
            suporte.
          </div>
        ) : (
          <div className="space-y-1">
            <Label>Horário de criação diária</Label>
            <Input
              type="time"
              value={generationTimeBr}
              onChange={(e) => setGenerationTimeBr(e.target.value)}
              disabled={!enabled}
            />
            <p className="text-xs text-muted-foreground">
              Todo dia neste horário (Brasília), o sistema gera as próximas viagens.
            </p>
          </div>
        )}

        {isCustomAutoCancelCron ? (
          <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
            Frequência de cancelamento personalizada configurada pelo suporte (
            <code className="font-mono">{config.autoCancelCron}</code>). Para alterar, contate o
            suporte.
          </div>
        ) : (
          <div className="space-y-1">
            <Label>Verificar viagens para cancelar</Label>
            <Select
              value={autoCancelOption}
              onValueChange={setAutoCancelOption}
              disabled={!enabled}
            >
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
            <p className="text-xs text-muted-foreground">
              Com que frequência o sistema verifica e cancela viagens sem inscrições suficientes
              (até 30 minutos antes da partida).
            </p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSave} disabled={!dirty || submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
