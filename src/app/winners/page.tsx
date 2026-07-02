import { adminClient } from "@/lib/supabase/admin";

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
      <h1 className="text-xl font-bold">Winner wall 🏆</h1>
      <p className="text-sm text-zinc-500">
        Real people, real airtime. Solve today&apos;s word and you&apos;re in
        tonight&apos;s draw.
      </p>
      {(!winners || winners.length === 0) && (
        <p className="text-sm text-zinc-500">
          First winners announced after tonight&apos;s 21:00 draw — it could be
          you!
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {(winners ?? []).map((w) => (
          <li
            key={w.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
          >
            <span>
              <span className="font-semibold">
                {w.first_name ?? "Player"}
              </span>{" "}
              <span className="text-zinc-500">{w.masked_msisdn}</span>
            </span>
            <span className="text-zinc-500">
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
