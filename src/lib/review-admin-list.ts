// Pure helpers behind the admin reviews list: text search + paging.
// Kept browser-safe and dependency-free so they can be unit tested.
import type { Review } from "./cd-data";

/** Reviews shown per page in the admin reviews table. */
export const REVIEWS_PAGE_SIZE = 25;

/** Everything a staffer might type to find this review. */
function haystack(r: Review): string {
  const state =
    r.status === "published"
      ? "published"
      : r.publishAt
        ? "scheduled draft"
        : r.submittedAt
          ? "awaiting approval draft"
          : "draft";
  return [r.title, r.artist, r.label, r.genre, r.format, r.byline, r.decade, r.kind, r.slug, state]
    .join(" ")
    .toLowerCase();
}

/**
 * Every term must appear somewhere in the row (order-free). Empty query returns
 * the list untouched so the table keeps its natural newest-first order.
 */
export function filterReviews(reviews: Review[], q: string): Review[] {
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return reviews;
  return reviews.filter((r) => {
    const text = haystack(r);
    return terms.every((t) => text.includes(t));
  });
}

export type Paged<T> = {
  items: T[];
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
};

/** Slice a list into 1-based pages. Out-of-range pages clamp to the nearest one. */
export function paginate<T>(items: T[], page: number, pageSize: number = REVIEWS_PAGE_SIZE): Paged<T> {
  const size = pageSize > 0 ? pageSize : 1;
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const wanted = Math.trunc(page) || 1;
  const current = Math.min(Math.max(1, wanted), pageCount);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: current,
    pageCount,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + size, items.length),
    total: items.length,
  };
}

/** Page buttons with gaps as "…", e.g. [1,"…",4,5,6,"…",20]. */
export function pageWindow(page: number, pageCount: number, span = 2): (number | "…")[] {
  if (pageCount <= 1) return pageCount === 1 ? [1] : [];
  const keep = new Set<number>([1, pageCount]);
  for (let p = page - span; p <= page + span; p++) {
    if (p >= 1 && p <= pageCount) keep.add(p);
  }
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}
