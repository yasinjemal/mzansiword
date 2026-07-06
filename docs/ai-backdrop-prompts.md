# Journey backdrop art — spec + AI generation prompts

The Journey ships with code-drawn gradient/silhouette backdrops. To upgrade a
chapter to full art, generate an image with the prompt below and drop the
file into `public/themes/` — **no code change needed**; the game detects the
file and fades it in over the fallback.

## Hard spec (every image)

| Property | Value |
|---|---|
| Size | 750 × 1600 px, portrait |
| Format | WebP, quality ~60 |
| File size | **≤ 150 KB** (SA mobile data budget — recompress until it fits) |
| Naming | exactly `<chapter-id>.webp` (see table below) |
| Content | No text, no logos, no people's faces |
| Composition | Key detail in the TOP HALF; bottom third must be dark and low-detail (UI sits on it) |
| Grading | Dusk/dark mood that blends into near-black `#0b1210` at the bottom |

Recompress example: `cwebp -q 60 -resize 750 1600 in.png -o table-mountain.webp`

## Shared style prefix (paste before each scene prompt)

> Stylized painterly flat illustration, mobile game backdrop, portrait
> 750x1600, dusk lighting, rich atmospheric depth, soft gradients, subtle
> green and gold colour grade, dark low-detail foreground fading to
> near-black at the bottom third, no text, no watermark, no people.

## Per-chapter prompts

### 

### 2. `wild-coast.webp` — Wild Coast
> Eastern Cape Wild Coast at dusk: rolling green hills meeting dramatic
> ocean cliffs, waves rolling in, round traditional huts as tiny distant
> silhouettes on a hilltop, teal-emerald palette (#0e2733 to #14554f) with
> seafoam-green accents (#34d399), moody misty atmosphere.
> Negative: roads, cars, text, people.

### 3. `drakensberg.webp` — Drakensberg Heights
> The Drakensberg amphitheatre at twilight: jagged dragon-spine peaks in
> layered purple-indigo silhouettes (#221f3a to #3a2f55), violet alpenglow
> (#a78bfa) on the highest ridges, stars beginning to show, valley mist
> below.
> Negative: snow-capped alps look, text, people.

### 4. `kruger.webp` — Kruger Sunset
> African bushveld sunset in Kruger: huge molten-gold sun low over savanna,
> flat-topped acacia trees and a lone elephant as black silhouettes, burnt
> orange and amber sky (#33150e to #7a3b14, accents #fbbf24), heat haze.
> Negative: safari vehicles, text, people.

### 5. `joburg.webp` — Joburg Lights
> Johannesburg skyline at night: Hillbrow Tower and Ponte City silhouettes,
> scattered warm window lights (#ffd166) against a deep indigo night sky
> (#101322 to #2b2440), faint city glow on the horizon, mine-dump ridges in
> the near-black foreground.
> Negative: recognisable brand billboards, text, people.

## Sponsor chapters

A sponsored chapter keeps its scene but may take the sponsor's palette.
Configure in `src/lib/journey/chapters.ts` (`sponsor: { name, tagline,
logoUrl }`) and drop the logo SVG/PNG in `public/sponsors/`. The map card
then shows "In partnership with {name}". Keep prize funding and art
sponsorship separate from gameplay — nothing purchasable, ever.

## Map thumbnails (later)

The chapter cards currently use palette gradients. If you want art there
too, export a 600×300 centre crop of each backdrop as
`<chapter-id>-wide.webp` (≤40 KB) — wiring that up is a small code change in
`ChapterCard`.
