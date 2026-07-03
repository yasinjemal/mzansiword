import { adminClient } from "@/lib/supabase/admin";
import { TrophyIcon } from "@/components/icons";

export const metadata = { title: "Winner wall — Mzansi Word" };
// Fresh winners on every request (view is service-role only).
export const dynamic = "force-dynamic";

export default async function WinnersPage() {
  const { data: winners } = await adminClient()
    .from("winner_wall")
    .select("id, first_name, masked_msisdn, amount_cents, draw_date, draw_type")
    .order("draw_date", { ascending: false })
    .limit(30);

  return (
    <div className="flex flex-col gap-4 pb-10">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
        <TrophyIcon className="h-6 w-6 text-gold" />
        Winner wall
      </h1>
      <p className="text-sm text-muted">
        Real people, real airtime. Solve today&apos;s word and you&apos;re in
        tonight&apos;s draw.
      </p>
      {(!winners || winners.length === 0) && (
        <p className="text-sm text-muted">
          First winners announced after tonight&apos;s 21:00 draw — it could be
          you!
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {(winners ?? []).map((w) => (
          <li
            key={w.id}
            className="flex items-center justify-between rounded-lg border border-edge bg-surface px-3 py-2 text-sm"
          >
            <span>
              <span className="font-semibold">
                {w.first_name ?? "Player"}
              </span>{" "}
              <span className="text-muted">{w.masked_msisdn}</span>
            </span>
            <span className="text-muted">
              R{(w.amount_cents / 100).toFixed(0)}
              {w.draw_type === "weekly_streak" ? " · streak bonus" : ""} ·{" "}
              {w.draw_date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
