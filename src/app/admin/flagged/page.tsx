import { adminClient } from "@/lib/supabase/admin";
import { BanButton, UnflagButton } from "@/components/AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminFlagged() {
  const { data: plays } = await adminClient()
    .from("plays")
    .select(
      "id, user_id, solve_ms, guess_count, flag_reason, finished_at, puzzles(track_code, puzzle_date), profiles(first_name, phone, banned)",
    )
    .eq("flagged", true)
    .order("finished_at", { ascending: false })
    .limit(100);

  const rows = (plays ?? []).map((p) => ({
    ...p,
    puzzle: p.puzzles as unknown as {
      track_code: string;
      puzzle_date: string;
    } | null,
    profile: p.profiles as unknown as {
      first_name: string | null;
      phone: string | null;
      banned: boolean;
    } | null,
  }));

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold">Flagged plays</h1>
      <p className="text-xs text-zinc-500">
        Flagged solves are excluded from draws. Unflag genuine ones; ban
        repeat offenders.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-300 dark:border-zinc-600">
              <th className="py-1 pr-2">Player</th>
              <th className="py-1 pr-2">Puzzle</th>
              <th className="py-1 pr-2">Solve</th>
              <th className="py-1 pr-2">Reason</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-zinc-200 dark:border-zinc-700"
              >
                <td className="py-1 pr-2">
                  {p.profile?.first_name ?? "—"}{" "}
                  <span className="text-zinc-500">{p.profile?.phone}</span>
                  {p.profile?.banned && (
                    <span className="ml-1 rounded bg-red-600 px-1 text-white">
                      banned
                    </span>
                  )}
                </td>
                <td className="py-1 pr-2">
                  {p.puzzle?.track_code} {p.puzzle?.puzzle_date}
                </td>
                <td className="py-1 pr-2">
                  {p.guess_count} guesses ·{" "}
                  {p.solve_ms !== null ? `${(p.solve_ms / 1000).toFixed(1)}s` : "—"}
                </td>
                <td className="py-1 pr-2">{p.flag_reason}</td>
                <td className="flex gap-1 py-1">
                  <UnflagButton playId={p.id} />
                  <BanButton
                    userId={p.user_id}
                    banned={p.profile?.banned ?? false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="text-sm text-zinc-500">Nothing flagged. Lekker.</p>
      )}
    </div>
  );
}
