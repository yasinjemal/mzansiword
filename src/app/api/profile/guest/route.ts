import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

// Creates a guest user entirely server-side using the admin/service-role
// client. This bypasses the need for Supabase "Anonymous Sign-ins" to be
// enabled in the dashboard. The client signs in with the returned credentials.
export async function POST() {
  const admin = adminClient();
  const id = randomUUID();
  const email = `guest-${id}@mzansiword.local`;
  const password = `gp-${randomUUID()}`;

  // 1. Create a confirmed user (skips email verification).
  const { data: created, error: createErr } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_guest: true },
    });

  if (createErr || !created.user) {
    return NextResponse.json(
      { error: "create_failed", detail: createErr?.message },
      { status: 500 },
    );
  }

  // 2. Create the profile row so the user can play immediately.
  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: created.user.id,
      first_name: "Guest",
      consent_popia_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileErr) {
    return NextResponse.json(
      { error: "profile_failed", detail: profileErr.message },
      { status: 500 },
    );
  }

  // 3. Return credentials so the client can sign in and get a session cookie.
  return NextResponse.json({ email, password });
}
