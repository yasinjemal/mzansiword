# Journey mode — design decisions

Words-of-Wonders-style letter-wheel crossword mode, added beside the daily
prize game. This file records the deliberate choices so they don't get
"fixed" later.

## Client-authoritative by design — do not add server validation

Each level JSON (committed under `src/data/journey/`) contains its grid
words AND bonus words; the client resolves every trace locally. This is
intentional:

- **No prize is attached to Journey.** The airtime draws hang off the daily
  game only, which stays fully server-validated. Cheating at Journey wins
  you nothing but your own spoiled fun.
- Instant feedback with zero network per word — critical on SA mobile data.
- Levels are playable offline once loaded.

The server (`/api/journey/*`) is only a **ledger**: progress cursor + coin
wallet, clamped server-side (`complete` awards only the next sequential
level and caps bonus counts against the level's real bonus list; `import`
clamps everything through `maxEarnable`).

## Coins are free-earned only — CPA constraint

Never add a purchase path for coins (or hints). Paid entry would turn the
daily prize draws into gambling under the Consumer Protection Act. Sponsors
may fund prizes/art, never sell gameplay advantage.

## Level generation

- `npm run generate-journey` — deterministic (seeded per track); output is
  committed so diffs are reviewable and builds are reproducible.
- Words 4–6 letters (no 3-letter list yet — grids are sparser than WoW's;
  adding a reviewed 3-letter CSV automatically densifies future runs).
- Wheels are 5–6 letters (wordlists cap at 6). Difficulty scales via grid
  word count and base-word rarity (see `CHAPTER_CONFIGS`).
- Anagram bases are deduped by letter signature — stone/notes would
  otherwise produce the same level twice.
- **isiXhosa currently generates ~15 levels (2 chapters)** from the ~390-word
  draft list. The manifest records reality and the UI is manifest-driven.
  The fix is wordlist growth (native-speaker review + expansion), then
  rerun the generator and extend `chapterImports` in
  `src/lib/journey/loader.ts` if new chapter files appear.

## Progress & wallet

- Guests: localStorage `mw:journey:v1` (starting grant 50 coins).
- Logged-in: Supabase `journey_progress` + `journey_wallets` (RLS
  select-own; writes via service-role routes). One-shot clamped import of
  guest progress on first login (`syncWithServer` in
  `src/lib/journey/progress.ts`); after that the server wins.
- Mid-level state is not persisted anywhere — abandoning a level forfeits
  in-level finds. Accepted for v1.

## Navigation model

`/journey/[track]/[level]` uses the global level number. The RSC page loads
the whole chapter JSON server-side and hands it to the client, so
within-chapter "Next level" is instant and offline-safe (URL kept in sync
via `history.replaceState`); chapter boundaries do a normal navigation.

## Backdrop art pipeline

Code-drawn palette gradient + landmark silhouette always renders; an
optional `public/themes/<chapter-id>.webp` (AI-generated, spec in
`docs/ai-backdrop-prompts.md`) fades in over it when present. Missing file
costs one cached 404 — that's the whole "pipeline".
