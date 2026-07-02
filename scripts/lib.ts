// Shared helpers for the tsx scripts. Loads .env.local and exposes a
// service-role Supabase client (never used in app client code).

import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

export function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export const WORD_RE = /^[a-z]{4,6}$/;

export interface WordRow {
  word: string;
  notes: string;
}

/**
 * Parse a word-list CSV: `word,notes` rows, `#` comment lines and blank
 * lines skipped, notes may contain commas (split on the first one only).
 */
export function parseWordCsv(path: string): {
  rows: WordRow[];
  invalid: string[];
} {
  const rows: WordRow[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const comma = line.indexOf(",");
    const word = (comma === -1 ? line : line.slice(0, comma))
      .trim()
      .toLowerCase();
    const notes = comma === -1 ? "" : line.slice(comma + 1).trim();
    if (!WORD_RE.test(word)) {
      invalid.push(word);
      continue;
    }
    if (seen.has(word)) continue;
    seen.add(word);
    rows.push({ word, notes });
  }
  return { rows, invalid };
}

export async function insertBatched(
  supabase: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
  batchSize = 500,
): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict, ignoreDuplicates: true });
    if (error) {
      throw new Error(`${table} upsert failed: ${error.message}`);
    }
  }
}
