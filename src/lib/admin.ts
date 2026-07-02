import "server-only";

import { createClient } from "./supabase/server";

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * The session caller's phone if it's in ADMIN_PHONES, else null. Comparison
 * is digits-only ("+27..." and "27..." both match).
 */
export async function getAdminPhone(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.phone) return null;

  const admins = (process.env.ADMIN_PHONES ?? "")
    .split(",")
    .map((p) => digitsOnly(p))
    .filter(Boolean);
  const phone = digitsOnly(user.phone);
  return admins.includes(phone) ? `+${phone}` : null;
}
