// Subanagram engine: which dictionary words can be formed from a set of
// wheel letters (respecting letter counts).

const A = 97; // 'a'

export function letterCounts(word: string): Uint8Array {
  const counts = new Uint8Array(26);
  for (let i = 0; i < word.length; i++) {
    counts[word.charCodeAt(i) - A]++;
  }
  return counts;
}

export function canForm(word: string, baseCounts: Uint8Array): boolean {
  const counts = new Uint8Array(26);
  for (let i = 0; i < word.length; i++) {
    const c = word.charCodeAt(i) - A;
    if (++counts[c] > baseCounts[c]) return false;
  }
  return true;
}

/** All dictionary words formable from the base word's letters (incl. base). */
export function formable(base: string, dictionary: readonly string[]): string[] {
  const baseCounts = letterCounts(base);
  return dictionary.filter((w) => w.length <= base.length && canForm(w, baseCounts));
}
