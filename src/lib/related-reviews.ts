export interface RelatedCandidate {
  slug: string;
  genre?: string | null;
  label?: string | null;
  decade?: string | null;
}

const norm = (v?: string | null) => {
  const s = (v ?? "").trim().toLowerCase();
  return s && s !== "uncategorized" && s !== "—" ? s : null;
};

/**
 * Rank reviews related to `current`: same genre, label, or decade.
 * Score: genre 3, label 2, decade 1. Excludes `current` itself.
 * Returns up to `limit` candidates, best match first, stable by input order.
 */
export function relatedReviews<T extends RelatedCandidate>(
  current: T,
  all: T[],
  limit = 4,
): T[] {
  const genre = norm(current.genre);
  const label = norm(current.label);
  const decade = norm(current.decade);

  return all
    .filter((r) => r.slug !== current.slug)
    .map((r, i) => {
      let score = 0;
      if (genre && norm(r.genre) === genre) score += 3;
      if (label && norm(r.label) === label) score += 2;
      if (decade && norm(r.decade) === decade) score += 1;
      return { r, score, i };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.r);
}
