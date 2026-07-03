// Fire-and-forget client analytics. Names must be in the server whitelist
// (src/app/api/track/route.ts). Never blocks gameplay; failures are silent.

export type EventName =
  | "daily_start"
  | "daily_solve"
  | "daily_fail"
  | "share_click"
  | "login"
  | "guest_login"
  | "journey_level_start"
  | "journey_level_complete"
  | "journey_chapter_complete"
  | "journey_bonus_word"
  | "journey_hint";

export function trackEvent(
  name: EventName,
  track?: string,
  props?: Record<string, string | number | boolean>,
): void {
  try {
    const body = JSON.stringify({ name, track, props });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}
