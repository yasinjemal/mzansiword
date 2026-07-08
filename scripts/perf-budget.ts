// Measures real per-route First Load JS (gzipped) from a production build —
// Next 16's build output no longer prints the size column, and the perf budget
// (PERFORMANCE.md: ≤ ~10 KB gz per feature) is a hard limit we must measure,
// not assume.
//
// How it works: every app route's `page_client-reference-manifest.js` lists
// the client JS chunks loaded up front (`entryJSFiles`); the framework runtime
// every page loads is `rootMainFiles` in `build-manifest.json`. First Load JS
// for a route = the union, gzipped. The "route-only" column is the route's
// chunks minus those common to every route — an upper bound on what any one
// feature on that route costs (a route bundles several features, so a
// route-only figure inside the budget proves every feature on it is too).
//
// Usage: npm run build && npm run perf-budget

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";

const NEXT_DIR = join(__dirname, "..", ".next");
const APP_DIR = join(NEXT_DIR, "server", "app");
const BUDGET_KB = 10;

function fail(msg: string): never {
  console.error(`✘ ${msg}`);
  process.exit(1);
}

if (!existsSync(join(NEXT_DIR, "BUILD_ID"))) {
  fail("No production build found — run `npm run build` first.");
}

// Gzipped size of a file under .next/, cached (chunks repeat across routes).
const gzCache = new Map<string, number>();
function gzKb(fileRelToNext: string): number {
  let size = gzCache.get(fileRelToNext);
  if (size === undefined) {
    const abs = join(NEXT_DIR, fileRelToNext);
    if (!existsSync(abs)) return 0; // stale manifest entry — count nothing
    size = gzipSync(readFileSync(abs), { level: 9 }).length;
    gzCache.set(fileRelToNext, size);
  }
  return size / 1024;
}

function findPageManifests(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findPageManifests(p));
    else if (entry.name === "page_client-reference-manifest.js") out.push(p);
  }
  return out;
}

interface RouteManifest {
  entryJSFiles?: Record<string, string[]>;
  entryCSSFiles?: Record<string, { path: string; inlined: boolean }[]>;
}

function parseManifest(file: string): RouteManifest {
  const raw = readFileSync(file, "utf8");
  const start = raw.indexOf("] = {");
  if (start === -1) fail(`Unrecognised manifest format: ${file}`);
  return JSON.parse(raw.slice(start + 4).trim().replace(/;$/, ""));
}

const buildManifest = JSON.parse(
  readFileSync(join(NEXT_DIR, "build-manifest.json"), "utf8"),
) as { rootMainFiles: string[] };

interface Route {
  route: string;
  js: Set<string>;
  cssKb: number;
}

const routes: Route[] = findPageManifests(APP_DIR)
  .map((file) => {
    const route =
      "/" +
      relative(APP_DIR, file)
        .split(sep)
        .slice(0, -1)
        .join("/");
    const m = parseManifest(file);
    const js = new Set<string>(buildManifest.rootMainFiles);
    for (const files of Object.values(m.entryJSFiles ?? {})) {
      for (const f of files) js.add(f);
    }
    const css = new Set<string>();
    for (const entries of Object.values(m.entryCSSFiles ?? {})) {
      for (const e of entries) if (!e.inlined) css.add(e.path);
    }
    let cssKb = 0;
    for (const f of css) cssKb += gzKb(f);
    return { route: route === "/" ? "/" : route, js, cssKb };
  })
  .filter((r) => !r.route.startsWith("/_global-error"))
  .sort((a, b) => a.route.localeCompare(b.route));

if (routes.length === 0) fail("No app routes found under .next/server/app.");

// Chunks every route loads — the shared baseline a single feature can't own.
const shared = [...routes[0].js].filter((f) =>
  routes.every((r) => r.js.has(f)),
);
const sharedKb = shared.reduce((kb, f) => kb + gzKb(f), 0);

const rows = routes.map((r) => {
  const totalKb = [...r.js].reduce((kb, f) => kb + gzKb(f), 0);
  const routeOnlyKb = [...r.js]
    .filter((f) => !shared.includes(f))
    .reduce((kb, f) => kb + gzKb(f), 0);
  return { ...r, totalKb, routeOnlyKb };
});

const w = Math.max(...rows.map((r) => r.route.length), 5) + 2;
console.log(`Shared baseline (all routes): ${sharedKb.toFixed(1)} KB gz\n`);
console.log(
  "route".padEnd(w) +
    "first-load".padStart(11) +
    "route-only".padStart(12) +
    "css".padStart(8) +
    "  budget",
);
for (const r of rows.sort((a, b) => b.routeOnlyKb - a.routeOnlyKb)) {
  const over = r.routeOnlyKb > BUDGET_KB;
  console.log(
    r.route.padEnd(w) +
      `${r.totalKb.toFixed(1)} KB`.padStart(11) +
      `${r.routeOnlyKb.toFixed(1)} KB`.padStart(12) +
      `${r.cssKb.toFixed(1)}`.padStart(8) +
      (over ? `  ⚠ > ${BUDGET_KB} KB route-only` : "  ok"),
  );
}
console.log(
  `\nNote: the ≤${BUDGET_KB} KB budget is per *feature*; "route-only" (route minus` +
    `\nthe all-route shared set) is an upper bound on any one feature there.` +
    `\nAsync chunks (e.g. dynamic imports like canvas-confetti) load later and` +
    `\nare correctly excluded from first-load figures.`,
);

const worst = rows.filter((r) => r.routeOnlyKb > BUDGET_KB);
if (worst.length) {
  console.log(
    `\n⚠ ${worst.length} route(s) exceed ${BUDGET_KB} KB route-only — inspect before` +
      `\nstamping the budget PASS (see PERFORMANCE.md).`,
  );
}
