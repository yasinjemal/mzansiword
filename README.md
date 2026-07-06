# Mzansi Word 🇿🇦

A free daily word game in South Africa's languages (isiXhosa + English at
launch), with real airtime prizes via a nightly random draw among solvers —
a CPA s36 promotional competition, not gambling. Mobile-first PWA built to be
opened from WhatsApp links.

**Stack:** Next.js (App Router) + Supabase (Postgres, phone-OTP auth, RLS),
deployed on Vercel with a nightly cron.

## Security model (the part that matters)

- The day's answer lives only in the `puzzles` table, which has **no RLS
  policy** — client keys physically cannot read it. All guess scoring happens
  server-side in `/api/guess`.
- Every game/prize write goes through route handlers using the service-role
  key (`src/lib/supabase/admin.ts`, guarded by `server-only`).
- Draws are auditable: each stores a crypto-random seed + sorted entrant
  snapshot; `npm run verify-draw` reproduces any past draw exactly.

## First-time setup

1. **Supabase project** (free tier): create one at supabase.com, then:
   ```
   npx supabase link --project-ref <YOUR_PROJECT_REF>
   npx supabase db push          # applies supabase/migrations/0001_init.sql
   ```
2. **Env:** copy `.env.example` to `.env.local` and fill in the project URL,
   anon key, service-role key (Project Settings → API), a random
   `CRON_SECRET`, and your own number in `ADMIN_PHONES`.
3. **Phone OTP:** in Supabase Dashboard → Authentication → Providers → Phone,
   enable it and connect Twilio Verify (enable the WhatsApp channel — much
   cheaper than SA SMS, with SMS fallback). Set per-phone and per-IP rate
   limits under Auth → Rate Limits.
4. **Words + puzzles:**
   ```
   npm run import-wordlists                       # loads draft CSVs
   npm run schedule-puzzles -- --days 90 --allow-draft   # dev only!
   ```
   For production: get the draft lists reviewed
   (`docs/wordlist-review-checklist.md`), mark rows `approved` in
   `words_answers`, then run the scheduler **without** `--allow-draft`.
5. **Run:** `npm run dev` → http://localhost:3000. Sign in with your real
   number (Twilio trial works), play, then test the draw:
   ```
   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-draw
   npm run verify-draw
   ```

## Deploy (Vercel)

- Import the repo, set all `.env.example` vars in Project → Settings →
  Environment Variables.
- `vercel.json` schedules `/api/cron/daily-draw` at 19:00 UTC = **21:00 SAST**
  nightly (SA has no DST). Vercel sends `CRON_SECRET` automatically as the
  Authorization bearer.
- After the first deploy, set `NEXT_PUBLIC_APP_URL` to the real domain
  (it also arms the production guard in `schedule-puzzles`).

## Operating the pilot

| Task | How |
|---|---|
| Nightly winners | Drawn automatically at 21:00 SAST; players see a claim banner in-app |
| Pay a prize | Winner claims (confirms network) → `/admin/prizes` → send airtime from your banking app → "Mark paid" with the reference |
| Suspicious solves | `/admin/flagged` (sub-10s solves are auto-excluded from draws); unflag or ban |
| Audit a draw | `/admin/draws` or `npm run verify-draw -- --draw <id>` |
| Top up puzzles | `npm run schedule-puzzles -- --days 90` monthly (approved words only) |
| Win cap | Max 2 prizes per number per calendar month (automatic) |

Admin pages are at `/admin` — visible only to numbers in `ADMIN_PHONES`
(everyone else gets a 404).

## Before public launch (non-negotiables)

- [ ] **Age gate + guardian consent for under-18s (POPIA §34–35)** — NOT yet
      built; designed in [`docs/RFC/0006`](docs/RFC/0006-age-gate-guardian-consent.md).
      Blocks any public launch that admits minors, and needs SA-counsel sign-off
      of the guardian copy. (The standing #1 principle; was previously missing
      from this list.)
- [ ] Native-speaker review of the isiXhosa lists (see
      `docs/wordlist-review-checklist.md`) — the lists ship as AI DRAFTS.
- [ ] **Approve the reviewed words** with `npm run approve-words -- --track xh
      --reviewer "Name"` (dry run), then `--apply`. Nothing schedules until words
      are `approved`; **English answers are DRAFT too**, not just isiXhosa.
- [ ] Replace `[PROMOTER NAME]` / `[CONTACT EMAIL]` in `/rules` and
      `/privacy` pages.
- [ ] One attorney pass over the competition rules (CPA s36) before scaling.
- [ ] Reschedule production puzzles from approved words only (the scheduler
      refuses `--allow-draft` when `NEXT_PUBLIC_APP_URL` is production).
- [ ] Confirm the OTP send rate limit (Supabase Auth) is tuned before a public
      link ships — each SMS costs real money and a forwarded link spikes fast.

## Scripts

- `npm test` — engine, time-boundary, RNG, and share-card unit tests
- `npm run import-wordlists` — CSVs → `words_answers` / `words_guesses` (as draft)
- `npm run approve-words -- --track xh --reviewer "Name" [--apply] [--file ...]` —
  apply a native-speaker review (keep/drop/fix) to `words_answers.status`; dry-run
  by default, audit-logged on `--apply`
- `npm run schedule-puzzles -- --days N [--from YYYY-MM-DD] [--allow-draft]`
- `npm run verify-draw [-- --draw <id>]` — reproduce a draw from its seed
- `node scripts/make-icons.mjs` — regenerate PWA icons / OG image
