import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// Whitelisted event names only — keeps the table clean and prevents junk.
const EVENT_NAMES = [
  "daily_start",
  "daily_solve",
  "daily_fail",
  "share_click",
  "login",
  "guest_login",
  "journey_level_start",
  "journey_level_complete",
  "journey_chapter_complete",
  "journey_bonus_word",
  "journey_hint",
  "journey_moment",
  "signature_moment",
  "signature_share",
] as const;

const BodySchema = z.object({
  name: z.enum(EVENT_NAMES),
  track: z.string().max(4).optional(),
  props: z
    .record(z.string().max(30), z.union([z.string().max(60), z.number(), z.boolean()]))
    .optional(),
});

export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // user is optional — guest events land with user_id null (no device IDs,
  // no IP: POPIA-light by construction)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await adminClient()
    .from("events")
    .insert({
      name: parsed.data.name,
      user_id: user?.id ?? null,
      track: parsed.data.track ?? null,
      props: parsed.data.props ?? null,
    });

  return NextResponse.json({ ok: true });
}
