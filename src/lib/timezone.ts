/**
 * Time-of-day helpers for the trip scheduling feature.
 *
 * Brazil sits on UTC−3 (no DST since 2019). The API stores `departureTimeOfDay` /
 * `arrivalTimeOfDay` as UTC `HH:mm` strings, but admins type and read them in
 * BR time. These helpers convert one to the other without touching the calendar
 * day — they wrap around modulo 24h.
 */

const BR_UTC_OFFSET_HOURS = 3;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const HHMM_REGEX = HHMM;

function parse(hhmm: string): [number, number] | null {
  if (!HHMM.test(hhmm)) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return [h, m];
}

function format(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Convert an HH:mm string from BR (UTC−3) to UTC. Returns null if the input is invalid. */
export function brHourToUtc(brHhmm: string | null | undefined): string | null {
  if (!brHhmm) return null;
  const parsed = parse(brHhmm);
  if (!parsed) return null;
  const [h, m] = parsed;
  return format((h + BR_UTC_OFFSET_HOURS + 24) % 24, m);
}

/** Convert an HH:mm string from UTC to BR (UTC−3). Returns null if the input is invalid. */
export function utcHourToBr(utcHhmm: string | null | undefined): string | null {
  if (!utcHhmm) return null;
  const parsed = parse(utcHhmm);
  if (!parsed) return null;
  const [h, m] = parsed;
  return format((h - BR_UTC_OFFSET_HOURS + 24) % 24, m);
}
