import { adminClient } from "@/lib/supabase/admin";
import { addDays, sastDateOf, sastToday } from "@/lib/time";

export const dynamic = "force-dynamic";

const DAYS = 14;

interface EventRow {
  name: string;
  user_id: string | null;
  track: string | null;
  created_at: string;
}

export default async function AdminStats() {
  const since = `${addDays(sastToday(), -(DAYS - 1))}T00:00:00+02:00`;
  const { data } = await adminClient()
    .from("events")
    .select("name, user_id, track, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20000);
  const events = (data ?? []) as EventRow[];

  // per-SAST-day aggregates (pilot volumes — in-process is fine)
  const days: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) days.push(addDays(sastToday(), -i));

  const byDay = new Map<
    string,
    { dau: Set<string>; solves: number; fails: number; shares: number; journey: number; hints: number; logins: number }
  >();
  for (const d of days) {
    byDay.set(d, { dau: new Set(), solves: 0, fails: 0, shares: 0, journey: 0, hints: 0, logins: 0 });
  }
  const totals = new Map<string, number>();

  for (const e of events) {
    totals.set(e.name, (totals.get(e.name) ?? 0) + 1);
    const day = sastDateOf(new Date(e.created_at));
    const bucket = byDay.get(day);
    if (!bucket) continue;
    if (e.user_id) bucket.dau.add(e.user_id);
    if (e.name === "daily_solve") bucket.solves++;
    if (e.name === "daily_fail") bucket.fails++;
    if (e.name === "share_click") bucket.shares++;
    if (e.name === "journey_level_complete" || e.name === "journey_chapter_complete") bucket.journey++;
    if (e.name === "journey_hint") bucket.hints++;
    if (e.name === "login") bucket.logins++;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-bold">Stats — last {DAYS} days</h1>
        <p className="text-xs text-muted">
          First-party events only (no third-party trackers). DAU counts
          signed-in players; guest events have no user attached.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-edge">
              <th className="py-1 pr-2">Day (SAST)</th>
              <th className="py-1 pr-2">DAU</th>
              <th className="py-1 pr-2">Solves</th>
              <th className="py-1 pr-2">Fails</th>
              <th className="py-1 pr-2">Solve %</th>
              <th className="py-1 pr-2">Shares</th>
              <th className="py-1 pr-2">Share %</th>
              <th className="py-1 pr-2">Journey lvls</th>
              <th className="py-1 pr-2">Hints</th>
              <th className="py-1 pr-2">Logins</th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => {
              const b = byDay.get(d)!;
              const played = b.solves + b.fails;
              return (
                <tr key={d} className="border-b border-edge">
                  <td className="py-1 pr-2">{d}</td>
                  <td className="py-1 pr-2">{b.dau.size}</td>
                  <td className="py-1 pr-2">{b.solves}</td>
                  <td className="py-1 pr-2">{b.fails}</td>
                  <td className="py-1 pr-2">
                    {played ? `${Math.round((b.solves / played) * 100)}%` : "—"}
                  </td>
                  <td className="py-1 pr-2">{b.shares}</td>
                  <td className="py-1 pr-2">
                    {b.solves ? `${Math.round((b.shares / b.solves) * 100)}%` : "—"}
                  </td>
                  <td className="py-1 pr-2">{b.journey}</td>
                  <td className="py-1 pr-2">{b.hints}</td>
                  <td className="py-1 pr-2">{b.logins}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-bold">Event totals ({DAYS}d)</h2>
        <ul className="flex flex-col gap-0.5 text-xs text-muted">
          {[...totals.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <li key={name}>
                <span className="font-mono">{name}</span>: {count}
              </li>
            ))}
          {totals.size === 0 && <li>No events yet — play a round!</li>}
        </ul>
      </div>
    </div>
  );
}
