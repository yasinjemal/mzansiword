import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDraws() {
  const { data: draws } = await adminClient()
    .from("draws")
    .select("id, draw_date, type, seed, algorithm, entrant_count, winners_requested, executed_at")
    .order("id", { ascending: false })
    .limit(60);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold">Draw audit log</h1>
      <p className="text-xs text-muted">
        Every draw is reproducible: `npm run verify-draw -- --draw &lt;id&gt;`
        re-runs it from the stored seed and entrant snapshot. Keep 3 years
        (CPA).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-edge">
              <th className="py-1 pr-2">#</th>
              <th className="py-1 pr-2">Date</th>
              <th className="py-1 pr-2">Type</th>
              <th className="py-1 pr-2">Entrants</th>
              <th className="py-1 pr-2">Winners</th>
              <th className="py-1 pr-2">Seed</th>
            </tr>
          </thead>
          <tbody>
            {(draws ?? []).map((d) => (
              <tr
                key={d.id}
                className="border-b border-edge"
              >
                <td className="py-1 pr-2">{d.id}</td>
                <td className="py-1 pr-2">{d.draw_date}</td>
                <td className="py-1 pr-2">{d.type}</td>
                <td className="py-1 pr-2">{d.entrant_count}</td>
                <td className="py-1 pr-2">{d.winners_requested}</td>
                <td className="max-w-40 truncate py-1 font-mono">{d.seed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!draws || draws.length === 0) && (
        <p className="text-sm text-muted">No draws yet.</p>
      )}
    </div>
  );
}
