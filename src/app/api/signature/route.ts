import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { knownMomentIds } from "@/lib/signature/catalog";

// Server mirror for Signature Moments. No prize/economy value is attached, so
// this is a convenience ledger (cross-device persistence), never a gate: the
// client already resolves and stores moments locally. We clamp recorded ids to
// the known catalog so the table can't be stuffed with junk.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await adminClient()
    .from("signature_moments")
    .select("moment_id")
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  return NextResponse.json({ awarded: (data ?? []).map((r) => r.moment_id) });
}

const BodySchema = z.object({
  ids: z.array(z.string().max(40)).min(1).max(20),
});

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

  const known = knownMomentIds();
  const rows = [...new Set(parsed.data.ids)]
    .filter((id) => known.has(id))
    .map((moment_id) => ({ user_id: user.id, moment_id }));

  if (rows.length === 0) {
    return NextResponse.json({ recorded: 0 });
  }

  // Idempotent: primary key (user_id, moment_id) makes re-records no-ops.
  const { error } = await adminClient()
    .from("signature_moments")
    .upsert(rows, { onConflict: "user_id,moment_id", ignoreDuplicates: true });
  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  return NextResponse.json({ recorded: rows.length });
}
