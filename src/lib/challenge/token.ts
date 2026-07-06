// Friend-challenge token (RFC-0004). A challenge is carried ENTIRELY in the
// deep-link URL — no table, no social graph, no server trust. The token is a
// base64url'd compact JSON of the challenger's first name, the puzzle number,
// and their guess count.
//
// SPOILER-SAFETY INVARIANT (load-bearing, RFC-0004 §Legal): the token carries
// ONLY a guess count and a name — NEVER letters, guessed words, or the answer.
// This module has no field for them and never will. token.test.ts pins this.

import { MAX_GUESSES } from "../game/types";

/** Max challenger-name length carried in a challenge (kept short for URLs). */
export const NAME_MAX = 12;

export interface Challenge {
  /** Challenger's first name, sanitised; may be "" (guests / no name). */
  name: string;
  /** Puzzle number the challenge is for (identifies the SAST day). */
  puzzle: number;
  /** Guesses the challenger used; 0 means they failed (X/6). */
  guesses: number;
}

/** Wire shape — short keys keep the URL compact. Versioned for forward-compat. */
interface Wire {
  v: 1;
  n: string;
  p: number;
  g: number;
}

/**
 * Strip a raw name to letters/marks/space/hyphen/apostrophe only, collapse
 * whitespace, and cap length. Removes any URL/markup/control characters, so a
 * name can never carry a link, script, or spoiler. Safe to render as text.
 */
export function sanitizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/[^\p{L}\p{M}'\- ]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NAME_MAX);
}

function clampGuesses(g: number): number {
  if (!Number.isFinite(g)) return 0;
  return Math.min(Math.max(0, Math.trunc(g)), MAX_GUESSES);
}

// Isomorphic base64url (btoa/atob are global in Node 18+ and the browser).
// TextEncoder/Decoder keep multi-byte names (diacritics) intact.
function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(token: string): string {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeChallenge(c: Challenge): string {
  const wire: Wire = {
    v: 1,
    n: sanitizeName(c.name),
    p: Math.max(0, Math.trunc(c.puzzle)),
    g: clampGuesses(c.guesses),
  };
  return b64urlEncode(JSON.stringify(wire));
}

/**
 * Decode a challenge token. Returns null for anything malformed, wrong-version,
 * or nonsensical. Only the four known fields are ever read — any extra keys a
 * crafted token might smuggle (e.g. the answer) are ignored, preserving the
 * spoiler invariant.
 */
export function decodeChallenge(token: string | null | undefined): Challenge | null {
  if (!token) return null;
  try {
    const wire = JSON.parse(b64urlDecode(token)) as Partial<Wire>;
    if (wire.v !== 1) return null;
    if (typeof wire.p !== "number" || !Number.isFinite(wire.p) || wire.p < 1) {
      return null;
    }
    if (typeof wire.g !== "number" || !Number.isFinite(wire.g)) return null;
    return {
      name: sanitizeName(typeof wire.n === "string" ? wire.n : ""),
      puzzle: Math.trunc(wire.p),
      guesses: clampGuesses(wire.g),
    };
  } catch {
    return null;
  }
}
