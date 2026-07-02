import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminPhone } from "@/lib/admin";
import { adminClient } from "@/lib/supabase/admin";

const BodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("mark_paid"),
    prizeId: z.number().int().positive(),
    payoutRef: z.string().trim().min(1).max(100),
  }),
  z.object({
    type: z.literal("unflag_play"),
    playId: z.number().int().positive(),
  }),
  z.object({
    type: z.literal("set_banned"),
    userId: z.string().uuid(),
    banned: z.boolean(),
  }),
]);

// Single admin mutation endpoint; every action lands in audit_log.
export async function POST(request: Request) {
  const admin = await getAdminPhone();
  if (!admin) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const action = parsed.data;
  const supabase = adminClient();

  if (action.type === "mark_paid") {
    const { data, error } = await supabase
      .from("prizes")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        paid_by: admin,
        payout_ref: action.payoutRef,
      })
      .eq("id", action.prizeId)
      .eq("status", "claimed")
      .select("id");
    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: "not_updatable" }, { status: 409 });
    }
  } else if (action.type === "unflag_play") {
    const { error } = await supabase
      .from("plays")
      .update({ flagged: false, flag_reason: null })
      .eq("id", action.playId);
    if (error) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("profiles")
      .update({ banned: action.banned })
      .eq("id", action.userId);
    if (error) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  }

  await supabase.from("audit_log").insert({
    actor: admin,
    action: `admin_${action.type}`,
    payload: action,
  });
  return NextResponse.json({ ok: true });
}
