import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  firstName: z.string().trim().min(1).max(40),
  consent: z.literal(true), // POPIA consent must be explicit
  deviceFp: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .nullish(),
});

// Records POPIA consent + first name after OTP signup. consent_popia_at is
// server-set (clients have no RLS grant to write it).
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

  const { error } = await adminClient()
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      consent_popia_at: new Date().toISOString(),
      ...(parsed.data.deviceFp ? { device_fp: parsed.data.deviceFp } : {}),
    })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
