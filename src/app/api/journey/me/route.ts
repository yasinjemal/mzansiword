import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getJourneyProgress, getWalletCoins } from "@/lib/journey/db";

// Journey progress + wallet for the signed-in player. coins === null means
// "no server wallet yet" — the client keeps showing its local balance.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const [rows, coins] = await Promise.all([
    getJourneyProgress(user.id),
    getWalletCoins(user.id),
  ]);

  const progress: Record<
    string,
    { levelsCompleted: number; bonusWordsFound: number }
  > = {};
  for (const row of rows) {
    progress[row.track_code] = {
      levelsCompleted: row.levels_completed,
      bonusWordsFound: row.bonus_words_found,
    };
  }

  return NextResponse.json({ progress, coins });
}
