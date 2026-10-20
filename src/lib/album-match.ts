// Browser-safe matching shared by the automatic Spotify and Discogs cover lookups.
// Both the artist AND the album must still match; "loose" only forgives the
// spelling and packaging differences that catalogues add to the same record.

/** Edition / packaging words that catalogues tack onto album titles. */
const EDITION_WORDS =
  "remaster(?:ed)?|deluxe|expanded|edition|anniversary|bonus|reissue|re-issue|version|special|collector'?s|legacy|" +
  "limited|mono|stereo|explicit|clean|digital|vinyl|cd|lp|ep|single|super|definitive|original|soundtrack|ost|" +
  "\\d{2,4}(?:th)?|\\d{4} mix|mix|live";

const BRACKETED = /\s*[([{][^)\]}]*[)\]}]\s*/g;
const DASH_SUFFIX = new RegExp(`\\s+[-–—:]\\s+(?:[^-–—:]*\\b(?:${EDITION_WORDS})\\b[^-–—:]*)$`, "i");
const TRAILING_FORMAT = /\s+(?:ep|lp|e\.p\.|l\.p\.)$/i;

/** Lowercase, strip accents/punctuation, unify "&"/"and", drop a leading "The". */
export function looseText(value: string): string {
  return value
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[’‘`´]/g, "'")
    .replace(/\s*(?:&|\+)\s*/g, " and ")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ");
}

/** The album title with edition/format packaging removed: "Abbey Road (Remastered 2019)" → "abbey road". */
export function albumCore(title: string): string {
  let t = title.normalize("NFKC");
  for (let i = 0; i < 3; i++) {
    const before = t;
    t = t.replace(BRACKETED, " ").replace(DASH_SUFFIX, "").replace(TRAILING_FORMAT, "").trim();
    if (t === before) break;
  }
  return looseText(t) || looseText(title);
}

/** Artist name without Discogs " (2)" disambiguation / trailing "*". */
export function artistCore(name: string): string {
  return looseText(name.replace(/\s*\(\d+\)\s*$/, "").replace(/\*+$/, ""));
}

const SELF_TITLED = new Set(["self titled", "s t", "st", "selftitled", "untitled"]);

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** Near-identical strings: tolerate a typo or two in titles of 8+ characters. */
function nearlyEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  if (len < 8) return false;
  return levenshtein(a, b) <= Math.max(1, Math.floor(len * 0.12));
}

/**
 * Score how well a catalogue album title fits the review's album title.
 * 3 = same after cleanup, 2 = one is the other plus extra words, 1 = near-identical spelling, 0 = no match.
 */
export function albumTitleScore(candidate: string, wanted: string, artist?: string): number {
  const c = albumCore(candidate);
  let w = albumCore(wanted);
  if (artist && SELF_TITLED.has(w)) w = artistCore(artist);
  if (!c || !w) return 0;
  if (c === w) return 3;
  const [short, long] = c.length <= w.length ? [c, w] : [w, c];
  // "Live at Massey Hall" ⊂ "Live at Massey Hall 1971"; require a real title, not one short word.
  if (short.split(" ").length >= 2 || short.length >= 6) {
    if (long.startsWith(short + " ") || long.endsWith(" " + short)) return 2;
  }
  if (nearlyEqual(c, w)) return 1;
  return 0;
}

/** Split "A & B", "A and B", "A, B", "A feat. B", "A with B" into individual names. */
function artistParts(name: string): string[] {
  return name
    .split(/\s*(?:,|&|\+|\/|;|\bfeat\.?|\bfeaturing\b|\bft\.?|\bwith\b|\bvs\.?|\band\b)\s*/i)
    .map(artistCore)
    .filter(Boolean);
}

/** True when the catalogue artist(s) and the review's artist refer to the same act. */
export function artistMatches(candidateArtists: string[], wanted: string): boolean {
  const w = artistCore(wanted);
  if (!w || candidateArtists.length === 0) return false;
  const cands = candidateArtists.map(artistCore).filter(Boolean);
  const joined = artistCore(candidateArtists.join(" and "));
  if (cands.includes(w) || joined === w) return true;
  if (/^various( artists)?$/.test(w)) return cands.some((c) => /^various( artists)?$/.test(c));
  // Collaborations: the review's first-named artist must be one of the catalogue's artists, or vice versa.
  const wParts = artistParts(wanted);
  const cParts = candidateArtists.flatMap(artistParts);
  if (wParts.length && cParts.includes(wParts[0])) return true;
  if (cParts.length && wParts.includes(cParts[0])) return true;
  return cands.some((c) => nearlyEqual(c, w));
}
