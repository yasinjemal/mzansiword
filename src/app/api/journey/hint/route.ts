import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ensureWallet } from "@/lib/journey/db";
import { HINT_COST, TARGET_HINT_COST } from "@/lib/journey/economy";

const BodySchema = z.object({
  type: z.enum(["hint", "target"]),
});

// Wallet ledger for a hint spend. The client chooses which cell to reveal —
// gameplay is client-authoritative; this only keeps the balance honest.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const cost = parsed.data.type === "hint" ? HINT_COST : TARGET_HINT_COST;

  await ensureWallet(user.id);
  const { data: coins, error } = await adminClient().rpc(
    "spend_journey_coins",
    { p_user: user.id, p_cost: cost },
  );
  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (coins === null) {
    return NextResponse.json({ error: "insufficient_coins" }, { status: 409 });
  }
  return NextResponse.json({ coins });
}
