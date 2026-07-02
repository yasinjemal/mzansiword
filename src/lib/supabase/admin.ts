import "server-only";

import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. This module must never be imported from
// client code — 'server-only' makes that a build error.
export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
