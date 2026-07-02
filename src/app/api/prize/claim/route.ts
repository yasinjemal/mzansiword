import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/game/db";
import { getPayoutProvider } from "@/lib/payout/manual";
import { NETWORKS } from "@/lib/payout/provider";

const BodySchema = z.object({
  prizeId: z.number().int().positive(),
  network: z.enum(NETWORKS),
  winnerWallConsent: z.boolean(),
});

// Pilot rule: airtime goes to the account's own verified number (prevents
// claim-farming). "Gift to another number" can come later with the API
// payout provider.
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
  const { prizeId, network, winnerWallConsent } = parsed.data;

  const profile = await getProfile(user.id);
  if (!profile?.phone) {
    return NextResponse.json({ error: "no_profile" }, { status: 403 });
  }
  const msisdn = profile.phone.startsWith("+")
    ? profile.phone
    : `+${profile.phone}`;

  const admin = adminClient();
  const now = new Date().toISOString();
  // Guarded update: only the owner's own pending, unexpired prize flips to
  // claimed. Zero rows updated = wrong prize, expired, or double claim.
  const { data: updated, error } = await admin
    .from("prizes")
    .update({
      status: "claimed",
      network,
      claim_msisdn: msisdn,
      winner_wall_consent: winnerWallConsent,
      claimed_at: now,
    })
    .eq("id", prizeId)
    .eq("user_id", user.id)
    .eq("status", "pending_claim")
    .gt("expires_at", now)
    .select("id, amount_cents");
  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: "not_claimable" }, { status: 409 });
  }

  const provider = getPayoutProvider();
  const result = await provider.send({
    msisdn,
    network,
    amountCents: updated[0].amount_cents,
  });
  if (result.status === "sent") {
    await admin
      .from("prizes")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        paid_by: provider.name,
        payout_provider: provider.name,
        payout_ref: result.ref,
      })
      .eq("id", prizeId);
  }

  await admin.from("audit_log").insert({
    actor: user.id,
    action: "prize_claimed",
    payload: { prize_id: prizeId, network, payout: result.status },
  });

  return NextResponse.json({ ok: true, payout: result.status });
}
