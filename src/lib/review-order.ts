// Date ordering for reviews. Review dates are stored as "MM.DD.YYYY" text, so a
// plain string comparison orders by month first — "12.31.2005" would beat
// "01.01.2006". Every page that claims to show the most recent reviews parses
// the date into a comparable key here instead. Browser-safe and dependency-free
// so it can be unit tested.
import type { Review } from "./cd-data";

/** "05.06.2026" -> "20260506". Anything unparseable yields "" and sorts last. */
export function dateKey(date: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(date?.trim() ?? "");
  if (!m) return "";
  const [, mm, dd, yyyy] = m;
  return `${yyyy}${mm.padStart(2, "0")}${dd.padStart(2, "0")}`;
}

/** Newest first. Equal days fall back to title so the order never jitters. */
export function byNewest(a: Review, b: Review): number {
  const d = dateKey(b.date).localeCompare(dateKey(a.date));
  return d !== 0 ? d : a.title.localeCompare(b.title);
}

/** Oldest first — the mirror of byNewest. */
export function byOldest(a: Review, b: Review): number {
  const d = dateKey(a.date).localeCompare(dateKey(b.date));
  return d !== 0 ? d : a.title.localeCompare(b.title);
}

/** The most recent `count` reviews, without mutating the caller's array. */
export function mostRecent(reviews: Review[], count: number): Review[] {
  return [...reviews].sort(byNewest).slice(0, Math.max(0, count));
}
