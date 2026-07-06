# Word-list review checklist (native-speaker sign-off)

Every answer word ships in a puzzle seen by thousands of players. A wrong or
offensive word kills credibility on day one, so **no word reaches production
puzzles until a native speaker has approved it** — the scheduler only draws
from rows with `status='approved'`.

## What the reviewer receives

The `data/wordlists/<track>/answers.draft.csv` file (word + gloss). Mark each
row **keep / fix / drop**. Fixes: write the corrected spelling next to the row.

## Per-word checks

1. **Orthography** — spelled correctly in the standard written form of the
   language (isiXhosa: current standard orthography, no dialectal spellings).
2. **Real and commonly known** — a first-language speaker of any region would
   recognise it. Drop regionalisms unknown outside one area.
3. **Fair as a puzzle answer** — common enough that guessing it feels
   satisfying, not obscure trivia. (Rare-but-real words belong in the guess
   dictionary instead.)
4. **Not offensive** — no vulgarity, slurs, sexual terms, or politically
   charged words. When in doubt, drop; there is no shortage of words. *(The
   `approve-words` tool auto-screens against an offensive blocklist
   ([`../src/lib/wordlist/safety.ts`](../src/lib/wordlist/safety.ts)) and refuses
   to approve a hit — but it's English-seeded, so **your native-language judgement
   is still the primary safeguard**; the tool is a backstop, not a substitute.)*
5. **Not a proper noun or brand** — no names of people, places, companies.
6. **Standalone form** — the word stands alone as written. isiXhosa
   convention in these lists: nouns carry their class prefix (indlu, not
   -ndlu); verbs are the stem/imperative form ending in -a (hamba, funda).
   Digraphs (hl, dl, ny, ng, th, ph, tsh) are typed letter by letter; clicks
   (c, x, q) are single letters; no diacritics.
7. **Length 4–6 letters** — anything else cannot fit the grid.

## Guess dictionary (`guesses.draft.csv`)

Lighter review: rows only gate what a player may *type*, never what they must
solve. Check for offensive entries and misspellings; obscure-but-real words
are welcome. Please also **add** valid words — a bigger guess dictionary makes
the game feel fairer ("that's a real word, why won't it take it?").

## Sign-off

| Field | |
|---|---|
| Language / track | |
| Reviewer name | |
| First-language speaker? | yes / no |
| Rows reviewed | |
| Date | |
| Signature | |

After sign-off, save the reviewer's marks as a decisions CSV at
`data/wordlists/<track>/answers.reviewed.csv` — one row per word:

```
# word,decision[,correction]   (decision = keep | drop | fix)
hamba,keep
indlu,drop
funda,fix,fundo
```

Then apply them with the tool (dry-run first — it prints the plan and refuses to
write if any word is invalid or contradictory):

```
npm run approve-words -- --track xh --reviewer "N. Speaker"          # dry run
npm run approve-words -- --track xh --reviewer "N. Speaker" --apply  # write + audit_log
```

`keep` → `approved`, `drop` → `rejected`, `fix` → rejects the misspelling and adds
the correction as an approved, guessable word. Then re-run
`npm run schedule-puzzles` to top up the 90-day runway. Keep the signed checklist
**and** the reviewed CSV with the competition records (CPA: 3 years). *(Manual
`update words_answers set status = …` still works if you prefer raw SQL.)*
