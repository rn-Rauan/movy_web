import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, TrendingUp, Users, Percent, Banknote, FileDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import {
  useFinancialReport,
  type FinancialReport,
} from "@/features/financial/hooks/useFinancialReport";
import { useRole } from "@/lib/role-context";
import { addBrMonths, getBrMonth, getBrYear, startOfBrMonth } from "@/lib/timezone";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_protected/_admin/financial")({
  component: FinancialPage,
});

const DAY_LABELS_BR = ["D", "S", "T", "Q", "Q", "S", "S"];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function fmtBR(n: number): { intPart: string; centPart: string } {
  const parts = n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [intPart, centPart] = parts.split(",");
  return { intPart: intPart ?? "0", centPart: centPart ?? "00" };
}
function fmtMoney(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FinancialPage() {
  const { adminOrgId } = useRole();
  const [offset, setOffset] = useState(0); // 0 = mês atual, -1 = mês anterior
  const monthStart = useMemo(() => addBrMonths(startOfBrMonth(), offset), [offset]);
  const monthLabel = `${MONTH_NAMES[getBrMonth(monthStart) - 1]} ${getBrYear(monthStart)}`;

  const { report, loading, error } = useFinancialReport(adminOrgId, monthStart);

  function exportCsv() {
    if (!report) return;
    const lines = [
      ["Métrica", "Valor"],
      ["Receita confirmada", fmtMoney(report.revConfirmed)],
      ["Receita pendente", fmtMoney(report.revPending)],
      ["Receita perdida", fmtMoney(report.revLost)],
      ["Mês anterior (confirmada)", fmtMoney(report.prevRevConfirmed)],
      ["Delta (%)", report.deltaPct == null ? "—" : report.deltaPct.toFixed(1)],
      ["Viagens realizadas", String(report.trips.realized)],
      ["Viagens confirmadas", String(report.trips.confirmed)],
      ["Viagens agendadas", String(report.trips.scheduled)],
      ["Viagens canceladas", String(report.trips.canceled)],
      ["Reservas perdidas (canceladas)", fmtMoney(report.canceledLostRevenue)],
      ["Passageiros", String(report.passengers)],
      ["Ocupação média (%)", String(report.avgOccupation)],
      ["Ticket médio", fmtMoney(report.avgTicket)],
      [],
      ["Top rotas", "Receita"],
      ...report.topRoutes.map((r) => [`${r.from} → ${r.to}`, fmtMoney(r.rev)]),
    ];
    const csv = lines
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    // BOM makes Excel detect UTF-8 correctly
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${getBrYear(monthStart)}-${String(getBrMonth(monthStart)).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  }

  return (
    <AppShell
      title="Relatório do mês"
      back
      action={
        <MonthSwitcher
          label={monthLabel}
          onPrev={() => setOffset((o) => o - 1)}
          onNext={() => setOffset((o) => Math.min(0, o + 1))}
          canNext={offset < 0}
        />
      }
    >
      {error ? (
        <ErrorCard message={error} />
      ) : loading || !report ? (
        <div className="flex flex-col gap-3">
          <LoadingList count={1} height="h-40" />
          <LoadingList count={1} height="h-32" />
          <LoadingList count={4} height="h-20" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <HeroRevenue report={report} />
          <WeeklyBarsCard report={report} />
          <RevenueHeatmapCard report={report} />

          <div>
            <SectionTitle title="Viagens do mês" sub={`${totalTrips(report)} no total`} />
            <div className="grid grid-cols-2 gap-2">
              <TripStatCard
                tone="success"
                label="Realizadas"
                value={report.trips.realized}
                sub="já aconteceram"
              />
              <TripStatCard
                tone="info"
                label="Confirmadas"
                value={report.trips.confirmed}
                sub="prontas pra rodar"
              />
              <TripStatCard
                tone="muted"
                label="Agendadas"
                value={report.trips.scheduled}
                sub="aguardando inscritos"
              />
              <TripStatCard
                tone="danger"
                label="Canceladas"
                value={report.trips.canceled}
                sub={
                  report.canceledLostRevenue > 0
                    ? `R$ ${fmtMoney(report.canceledLostRevenue)} em reservas perdidas`
                    : "sem reservas perdidas"
                }
              />
            </div>
          </div>

          <MiniKpiStrip report={report} />

          <div>
            <SectionTitle title="Top rotas" sub="Maior receita" />
            {report.topRoutes.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface px-4 py-6 text-center text-[12px] text-muted-foreground">
                Sem viagens neste mês.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                {report.topRoutes.map((r, i) => (
                  <RouteRow
                    key={r.key}
                    rank={i + 1}
                    from={r.from}
                    to={r.to}
                    trips={r.trips}
                    occ={r.occ}
                    rev={r.rev}
                    last={i === report.topRoutes.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[13px] font-bold text-ink transition hover:bg-surface-2"
          >
            <FileDown className="h-4 w-4" strokeWidth={1.7} />
            Exportar relatório (.csv)
          </button>
        </div>
      )}
    </AppShell>
  );
}

function totalTrips(r: FinancialReport): number {
  return (
    r.trips.realized +
    r.trips.confirmed +
    r.trips.scheduled +
    r.trips.canceled +
    r.trips.draft +
    r.trips.inProgress
  );
}

// ─── Month switcher ───────────────────────────────────────────────────────────

function MonthSwitcher({
  label,
  onPrev,
  onNext,
  canNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-1 py-0.5">
      <button
        onClick={onPrev}
        className="flex h-6 w-6 items-center justify-center rounded-full text-ink-2 transition hover:bg-line-soft"
        aria-label="Mês anterior"
      >
        <ChevronDown className="h-3 w-3 rotate-90" strokeWidth={2} />
      </button>
      <span className="px-1 text-[11px] font-bold text-ink-2">{label}</span>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex h-6 w-6 items-center justify-center rounded-full text-ink-2 transition hover:bg-line-soft disabled:opacity-30"
        aria-label="Próximo mês"
      >
        <ChevronDown className="h-3 w-3 -rotate-90" strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroRevenue({ report }: { report: FinancialReport }) {
  const { intPart, centPart } = fmtBR(report.revTotal);
  const total = Math.max(0.01, report.revConfirmed + report.revPending + report.revLost);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-4 text-white">
      <div className="text-[11px] font-semibold uppercase tracking-[0.3px] text-white/60">
        Receita do mês
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-mono text-[16px] font-bold text-white/55">R$</span>
        <div className="font-mono text-[38px] font-extrabold leading-none tracking-[-1.5px]">
          {intPart}
          <span className="text-[20px] text-white/50">,{centPart}</span>
        </div>
      </div>

      {report.deltaPct !== null && (
        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-bold",
              report.deltaPct >= 0
                ? "bg-[rgba(127,212,157,0.12)] text-[#7fd49d]"
                : "bg-danger-soft text-danger",
            )}
          >
            <TrendingUp
              className={cn("h-2.5 w-2.5", report.deltaPct < 0 && "rotate-180")}
              strokeWidth={2.4}
            />
            {report.deltaPct >= 0 ? "+" : ""}
            {report.deltaPct.toFixed(1)}%
          </span>
          <span className="text-white/55">
            vs R$ {fmtMoney(report.prevRevConfirmed)} no mês anterior
          </span>
        </div>
      )}

      {/* Stacked bar — confirmada / pendente / perdida */}
      <div className="mt-4">
        <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
          <div className="bg-accent" style={{ flex: report.revConfirmed }} />
          <div className="bg-white/55" style={{ flex: report.revPending }} />
          <div className="bg-white/[0.18]" style={{ flex: report.revLost }} />
          {total === 0.01 && <div className="flex-1" />}
        </div>
        <div className="mt-2.5 flex gap-3 text-[11px]">
          <RevLegend dotClass="bg-accent" label="Confirmada" value={report.revConfirmed} />
          <RevLegend dotClass="bg-white/55" label="Pendente" value={report.revPending} />
          <RevLegend dotClass="bg-white/[0.18]" label="Perdida" value={report.revLost} muted />
        </div>
      </div>
    </div>
  );
}

function RevLegend({
  dotClass,
  label,
  value,
  muted,
}: {
  dotClass: string;
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex flex-1 flex-col gap-1", muted && "opacity-60")}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2px] text-white/70">
        <span className={cn("h-2 w-2 rounded-sm", dotClass)} /> {label}
      </div>
      <div className="font-mono text-[12px] font-extrabold text-white">
        <span className="font-semibold text-white/55">R$ </span>
        {fmtMoney(value)}
      </div>
    </div>
  );
}

// ─── Weekly bars chart ────────────────────────────────────────────────────────

function WeeklyBarsCard({ report }: { report: FinancialReport }) {
  const weekMax = Math.max(1, ...report.weeks);
  const totalConfirmed = report.weeks.reduce((s, v) => s + v, 0);
  const lastWeek = report.weeks[report.weeks.length - 1] ?? 0;
  const trend =
    report.weeks.length >= 2 && lastWeek > (report.weeks[report.weeks.length - 2] ?? 0)
      ? "Aceleração na última semana"
      : totalConfirmed === 0
        ? "Sem receita confirmada"
        : "Receita confirmada por semana";

  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
            Receita por semana
          </div>
          <div className="mt-0.5 text-[14px] font-extrabold tracking-[-0.2px] text-ink">
            {trend}
          </div>
        </div>
      </div>

      <div className="flex h-[110px] items-end gap-2.5 border-b border-dashed border-line pb-1">
        {report.weeks.map((v, i) => {
          const h = (v / weekMax) * 88;
          const isLast = i === report.weeks.length - 1 && v > 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "font-mono text-[10px] font-bold",
                  isLast ? "text-accent" : "text-ink-2",
                )}
              >
                R$ {Math.round(v)}
              </div>
              <div
                className={cn(
                  "w-full rounded-t-md",
                  isLast ? "bg-accent" : "border border-line bg-line-soft",
                )}
                style={{ height: `${Math.max(4, h)}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2.5">
        {report.weekLabels.map((l) => (
          <div key={l} className="flex-1 text-center text-[10px] font-bold text-muted-foreground">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Revenue heatmap (semana × dia da semana) ──────────────────────────────────

function RevenueHeatmapCard({ report }: { report: FinancialReport }) {
  const flat = report.daysGrid.flat();
  const max = Math.max(1, ...flat);
  const hasData = flat.some((v) => v > 0);

  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
        Receita por dia
      </div>

      {!hasData ? (
        <div className="py-4 text-center text-[12px] text-muted-foreground">
          Sem receita confirmada neste mês.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {/* Cabeçalho dos dias da semana */}
          <div className="flex items-center gap-1.5">
            <div className="w-10 flex-none" />
            {DAY_LABELS_BR.map((d, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[9px] font-bold uppercase text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          {report.daysGrid.map((week, wi) => (
            <div key={wi} className="flex items-center gap-1.5">
              <div className="w-10 flex-none text-[10px] font-bold text-muted-foreground">
                {report.weekLabels[wi]}
              </div>
              {week.map((value, di) => {
                const intensity = value / max; // 0..1
                return (
                  <div
                    key={di}
                    className="flex-1"
                    aria-label={`${report.weekLabels[wi]} ${DAY_LABELS_BR[di]}: R$ ${fmtMoney(value)}`}
                    title={`R$ ${fmtMoney(value)}`}
                  >
                    <div
                      className="aspect-square w-full rounded-[5px] border border-line-soft bg-accent"
                      style={{ opacity: value > 0 ? 0.18 + intensity * 0.82 : 0.06 }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-2 px-0.5">
      <div className="flex items-baseline gap-2">
        <h2 className="m-0 text-[15px] font-extrabold tracking-[-0.2px] text-ink">{title}</h2>
        {sub && <span className="text-[11px] font-semibold text-muted-foreground">· {sub}</span>}
      </div>
    </div>
  );
}

// ─── Trip stat card ───────────────────────────────────────────────────────────

const TONE_CLASS: Record<string, { bg: string; fg: string }> = {
  success: { bg: "bg-success-soft", fg: "text-success" },
  info: { bg: "bg-info-soft", fg: "text-info" },
  danger: { bg: "bg-danger-soft", fg: "text-danger" },
  muted: { bg: "bg-line-soft", fg: "text-muted-foreground" },
};

function TripStatCard({
  tone,
  label,
  value,
  sub,
}: {
  tone: "success" | "info" | "danger" | "muted";
  label: string;
  value: number;
  sub?: string;
}) {
  const c = TONE_CLASS[tone] ?? TONE_CLASS.muted;
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.3px]",
          c!.bg,
          c!.fg,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", c!.fg.replace("text-", "bg-"))} />
        {label}
      </span>
      <div className="mt-2 font-mono text-[30px] font-extrabold leading-none tracking-[-1.2px] text-ink">
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ─── Mini KPI strip ───────────────────────────────────────────────────────────

function MiniKpiStrip({ report }: { report: FinancialReport }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-surface">
      <MiniKpi icon={Users} label="Passageiros" value={report.passengers.toLocaleString("pt-BR")} />
      <MiniKpi icon={Percent} label="Ocup. média" value={`${report.avgOccupation}%`} divide />
      <MiniKpi
        icon={Banknote}
        label="Ticket médio"
        value={`R$ ${fmtMoney(report.avgTicket).split(",")[0]}`}
        divide
      />
    </div>
  );
}

function MiniKpi({
  icon: Icon,
  label,
  value,
  divide,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  divide?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-3", divide && "border-l border-line-soft")}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={1.7} />
        <span className="text-[10px] font-bold uppercase tracking-[0.3px]">{label}</span>
      </div>
      <div className="font-mono text-[18px] font-extrabold leading-none tracking-[-0.5px] text-ink">
        {value}
      </div>
    </div>
  );
}

// ─── Route row ────────────────────────────────────────────────────────────────

function RouteRow({
  rank,
  from,
  to,
  trips,
  occ,
  rev,
  last,
}: {
  rank: number;
  from: string;
  to: string;
  trips: number;
  occ: number;
  rev: number;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-3", !last && "border-b border-line-soft")}>
      <div
        className={cn(
          "flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md font-mono text-[11px] font-extrabold",
          rank === 1 ? "bg-accent text-white" : "bg-line-soft text-ink-2",
        )}
      >
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold leading-tight tracking-[-0.1px] text-ink">
          {from}
          {to && to !== "—" ? ` → ${to}` : ""}
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {trips} {trips === 1 ? "viagem" : "viagens"} · ocup. {occ}%
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[13px] font-extrabold tracking-[-0.3px] text-ink">
          <span className="font-semibold text-muted-foreground">R$ </span>
          {fmtMoney(rev)}
        </div>
      </div>
    </div>
  );
}
