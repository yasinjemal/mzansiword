import type { TrackCode } from "./engine/keyboard";

// UI copy for the launch tracks. The DB language_tracks.enabled flag is the
// source of truth for scheduling; keep this in sync when enabling zu/af.
export const LIVE_TRACKS: { code: TrackCode; name: string }[] = [
  { code: "xh", name: "isiXhosa" },
  { code: "en", name: "English" },
];

export const TRACK_NAMES: Record<string, string> = {
  xh: "isiXhosa",
  en: "English",
  zu: "isiZulu",
  af: "Afrikaans",
};

export const DEFAULT_TRACK: TrackCode = "xh";

export function isLiveTrack(code: string): code is TrackCode {
  return LIVE_TRACKS.some((t) => t.code === code);
}
