// Re-runs a past draw from its stored seed + entrant snapshot and compares
// the result to the prizes actually created — the CPA auditability check.
//
// Usage: npm run verify-draw -- --draw <id>
//        npm run verify-draw            (verifies the most recent draw)

import { adminClient } from "./lib";
import { selectWinners, type Entrant } from "../src/lib/draw/select";

async function main() {
  const supabase = adminClient();
  const idArg = process.argv.indexOf("--draw");

  let query = supabase
    .from("draws")
    .select("id, draw_date, type, seed, algorithm, entrants, winners_requested")
    .order("id", { ascending: false })
    .limit(1);
  if (idArg !== -1) {
    query = supabase
      .from("draws")
      .select("id, draw_date, type, seed, algorithm, entrants, winners_requested")
      .eq("id", Number(process.argv[idArg + 1]))
      .limit(1);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const draw = data?.[0];
  if (!draw) throw new Error("No draw found");

  const recomputed = selectWinners(
    draw.entrants as Entrant[],
    draw.seed,
    draw.winners_requested,
  );

  const { data: prizes, error: prizeErr } = await supabase
    .from("prizes")
    .select("user_id")
    .eq("draw_id", draw.id)
    .order("id");
  if (prizeErr) throw new Error(prizeErr.message);
  const recorded = (prizes ?? []).map((p) => p.user_id);

  console.log(`Draw #${draw.id} (${draw.type}, ${draw.draw_date})`);
  console.log(`  algorithm : ${draw.algorithm}`);
  console.log(`  seed      : ${draw.seed}`);
  console.log(`  entrants  : ${(draw.entrants as Entrant[]).length}`);
  console.log(`  recomputed: ${recomputed.join(", ") || "(none)"}`);
  console.log(`  recorded  : ${recorded.join(", ") || "(none)"}`);

  const match =
    recomputed.length === recorded.length &&
    recomputed.every((w, i) => w === recorded[i]);
  console.log(match ? "✔ VERIFIED — winners reproduce exactly" : "✘ MISMATCH");
  if (!match) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
