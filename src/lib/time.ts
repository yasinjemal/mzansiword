// All puzzle-day math lives here. The puzzle day boundary is midnight in
// Africa/Johannesburg (SAST, UTC+2, no DST) regardless of server timezone.
// Never use Date#toISOString().slice(0, 10) for a puzzle date — that's UTC.

const SAST_TZ = "Africa/Johannesburg";

// en-CA formats as YYYY-MM-DD.
const sastDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: SAST_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DAY_MS = 24 * 60 * 60 * 1000;

/** The SAST calendar date ('YYYY-MM-DD') of a given instant. */
export function sastDateOf(instant: Date): string {
  return sastDateFmt.format(instant);
}

export function sastToday(now: Date = new Date()): string {
  return sastDateOf(now);
}

export function sastYesterday(now: Date = new Date()): string {
  // SAST has a fixed offset, so 24h earlier is always the previous SAST day.
  return sastDateOf(new Date(now.getTime() - DAY_MS));
}

/** Milliseconds until the next SAST midnight (= 22:00 UTC). */
export function msUntilNextSastMidnight(now: Date = new Date()): number {
  const next = new Date(now);
  next.setUTCHours(22, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

/** Add n days to a 'YYYY-MM-DD' date string. */
export function addDays(sastDate: string, n: number): string {
  const d = new Date(`${sastDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** First puzzle day; puzzle #1 is this date. */
export const LAUNCH_DATE = "2026-07-06";

export function puzzleNumber(sastDate: string): number {
  return (
    Math.round((Date.parse(sastDate) - Date.parse(LAUNCH_DATE)) / DAY_MS) + 1
  );
}
