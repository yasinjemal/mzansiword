import "server-only";

import { adminClient } from "./supabase/admin";

/**
 * Fire-and-forget server-side analytics into the `events` table (migration
 * 0003). Service-role only. Never throws into the request path — telemetry must
 * not break gameplay (same discipline as the client `trackEvent`). Event names
 * are server-authored here, so they bypass the client `/api/track` whitelist;
 * keep them in the TELEMETRY.md catalog. `name` must be ≤ 40 chars (table check).
 */
export async function logEvent(
  name: string,
  opts: {
    userId?: string | null;
    track?: string | null;
    props?: Record<string, string | number | boolean | null>;
  } = {},
): Promise<void> {
  try {
    await adminClient()
      .from("events")
      .insert({
        name,
        user_id: opts.userId ?? null,
        track: opts.track ?? null,
        props: opts.props ?? null,
      });
  } catch {}
}
