/**
 * Timezone helpers para o frontend Movy.
 *
 * O backend armazena/recebe todos os horários em UTC; a UI sempre exibe em
 * horário de Brasília. Esses helpers centralizam a conversão.
 *
 * Estratégia: `Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" })`
 * via `formatToParts()` para extrair componentes em BR de forma resiliente
 * (lida com DST automaticamente se voltar — BR já mudou de regra antes).
 *
 * Os helpers de HH:mm (`brHourToUtc`/`utcHourToBr`) usam offset fixo −3 porque
 * cron expressions / time-of-day strings vêm sem contexto de data e o backend
 * grava como UTC HH:mm. Enquanto não houver DST, isso é exato.
 */

export const BR_TZ = "America/Sao_Paulo";

const BR_UTC_OFFSET_HOURS = 3;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const HHMM_REGEX = HHMM;

function parseHhmm(hhmm: string): [number, number] | null {
  if (!HHMM.test(hhmm)) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return [h, m];
}

function formatHhmm(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Convert an HH:mm string from BR (UTC−3) to UTC. Returns null if the input is invalid. */
export function brHourToUtc(brHhmm: string | null | undefined): string | null {
  if (!brHhmm) return null;
  const parsed = parseHhmm(brHhmm);
  if (!parsed) return null;
  const [h, m] = parsed;
  return formatHhmm((h + BR_UTC_OFFSET_HOURS + 24) % 24, m);
}

/** Convert an HH:mm string from UTC to BR (UTC−3). Returns null if the input is invalid. */
export function utcHourToBr(utcHhmm: string | null | undefined): string | null {
  if (!utcHhmm) return null;
  const parsed = parseHhmm(utcHhmm);
  if (!parsed) return null;
  const [h, m] = parsed;
  return formatHhmm((h - BR_UTC_OFFSET_HOURS + 24) % 24, m);
}

// ─── ISO / Date helpers em BR ────────────────────────────────────────────────

type BrParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number;
  second: number;
  weekday: number; // 0=domingo … 6=sábado
};

// Formatter dedicado pra extrair YYYY-MM-DD em BR — `en-CA` devolve o formato ISO
// canônico via `.format()` (mais previsível que ler `formatToParts` quando há mix
// de campos de data + hora). É a fonte da verdade pra `isoToBrYmd`.
const BR_YMD_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: BR_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Formatter separado pra extrair componentes de hora/minuto/weekday — sem flags
// que conflitem com a extração de `day`/`month`/`year`.
const BR_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: BR_TZ,
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
});

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function toDate(input: string | Date): Date {
  return typeof input === "string" ? new Date(input) : input;
}

function brPartsOf(input: string | Date): BrParts {
  const d = toDate(input);
  // Date components vêm do formatter canônico (en-CA "YYYY-MM-DD")
  const ymd = BR_YMD_FORMATTER.format(d); // "YYYY-MM-DD"
  const [yStr, moStr, dStr] = ymd.split("-");
  // Time components + weekday vêm do formatter de tempo
  const parts = BR_PARTS_FORMATTER.formatToParts(d);
  const pick = (type: string): string => parts.find((p) => p.type === type)?.value ?? "0";
  // `hour: "2-digit"` com `hour12: false` em "en-US" às vezes devolve "24" pra meia-noite
  const hourRaw = Number(pick("hour"));
  return {
    year: Number(yStr),
    month: Number(moStr),
    day: Number(dStr),
    hour: hourRaw === 24 ? 0 : hourRaw,
    minute: Number(pick("minute")),
    second: Number(pick("second")),
    weekday: WEEKDAY_INDEX[pick("weekday")] ?? 0,
  };
}

/** Hora (0-23) de um instante interpretado em BR. Substitui `.getHours()`. */
export function getBrHour(input: string | Date): number {
  return brPartsOf(input).hour;
}

/** Minuto (0-59) de um instante interpretado em BR. Substitui `.getMinutes()`. */
export function getBrMinute(input: string | Date): number {
  return brPartsOf(input).minute;
}

/** "YYYY-MM-DD" em BR de um ISO/Date. */
export function isoToBrYmd(input: string | Date): string {
  return BR_YMD_FORMATTER.format(toDate(input));
}

/** Dia da semana (0=domingo) em BR. */
export function brDayOfWeek(input: string | Date): number {
  return brPartsOf(input).weekday;
}

/** Date que representa 00:00 BR de uma data calendário "YYYY-MM-DD". */
export function brYmdToUtcDate(ymd: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return new Date(NaN);
  const [, y, mo, d] = m;
  // 00:00 BR = 03:00 UTC.
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), BR_UTC_OFFSET_HOURS, 0, 0, 0));
}

/** "Início do dia" em BR como Date absoluto. Default = agora. */
export function startOfBrDay(input?: string | Date): Date {
  const base = input ? toDate(input) : new Date();
  return brYmdToUtcDate(isoToBrYmd(base));
}

/** Mês BR (1-12) de um instante. */
export function getBrMonth(input: string | Date): number {
  return brPartsOf(input).month;
}

/** Ano BR de um instante. */
export function getBrYear(input: string | Date): number {
  return brPartsOf(input).year;
}

/** Dia BR (1-31) de um instante. */
export function getBrDayOfMonth(input: string | Date): number {
  return brPartsOf(input).day;
}

/**
 * Date que representa 00:00 BR no primeiro dia do mês BR ao qual `input` pertence.
 * Default = agora.
 */
export function startOfBrMonth(input?: string | Date): Date {
  const base = input ? toDate(input) : new Date();
  const { year, month } = brPartsOf(base);
  return new Date(Date.UTC(year, month - 1, 1, BR_UTC_OFFSET_HOURS, 0, 0, 0));
}

/** Adiciona `n` meses ao Date no calendário BR; preserva o "00:00 BR do dia 1". */
export function addBrMonths(d: Date, n: number): Date {
  const { year, month } = brPartsOf(d);
  return new Date(Date.UTC(year, month - 1 + n, 1, BR_UTC_OFFSET_HOURS, 0, 0, 0));
}
