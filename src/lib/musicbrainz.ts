// Pure helpers for the "From the community" block: matching a cdreviews album to a
// MusicBrainz release group, and choosing which CritiqueBrainz reviews we may show.
import { albumTitleScore, artistMatches } from "./album-match";

export type MbReleaseGroup = {
  id: string;
  title: string;
  "primary-type"?: string;
  score?: number;
  "artist-credit"?: Array<{ name?: string; artist?: { name?: string } }>;
};

/** Best release group for this artist + album, or null when nothing clearly matches. */
export function pickReleaseGroup(groups: MbReleaseGroup[], artist: string, album: string): MbReleaseGroup | null {
  let best: MbReleaseGroup | null = null;
  let bestScore = 0;
  for (const g of groups) {
    const names = (g["artist-credit"] ?? []).flatMap((c) => [c.name, c.artist?.name]).filter((n): n is string => !!n);
    const joined = (g["artist-credit"] ?? []).map((c) => c.name ?? c.artist?.name ?? "").join(" ").trim();
    if (joined) names.push(joined);
    if (!names.length || !artistMatches(names, artist)) continue;
    const titleScore = albumTitleScore(g.title, album, artist);
    if (titleScore <= 0) continue;
    // Prefer real albums over singles/compilations when titles fit equally well.
    const s = titleScore * 4 + (g["primary-type"] === "Album" ? 2 : g["primary-type"] === "EP" ? 1 : 0);
    if (s > bestScore) { best = g; bestScore = s; }
  }
  return best;
}

export type CbReview = {
  id: string;
  text?: string | null;
  rating?: number | null;
  published_on?: string;
  created?: string;
  last_updated?: string;
  popularity?: number;
  is_hidden?: boolean;
  is_draft?: boolean;
  language?: string;
  user?: { id?: string; display_name?: string };
  license?: { id?: string; full_name?: string; info_url?: string };
};

export type CommunityReview = {
  id: string;
  author: string;
  authorUrl: string | null;
  url: string;
  publishedOn: string | null;
  rating: number | null;
  paragraphs: string[];
  truncated: boolean;
  license: { id: string; url: string };
};

/** cdreviews carries ads, so only licenses that allow commercial use (no "NC"). */
export function isCommercialLicense(id: string | undefined): boolean {
  if (!id) return false;
  const l = id.toUpperCase();
  return l.startsWith("CC") && !l.includes("NC") && !l.includes("ND");
}

/** Markdown → plain paragraphs (CritiqueBrainz reviews are written in Markdown). */
export function plainParagraphs(markdown: string): string[] {
  return markdown
    .replace(/\r\n?/g, "\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .split(/\n\s*\n/)
    .map((p) => p
      .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/gm, "")
      .replace(/(\*\*|__|\*|_|`)(.+?)\1/g, "$2")
      .replace(/\s+/g, " ")
      .trim())
    .filter(Boolean);
}

/** Cut to roughly `limit` characters at a word boundary. */
export function excerpt(paragraphs: string[], limit = 700): { paragraphs: string[]; truncated: boolean } {
  const out: string[] = [];
  let used = 0;
  for (const p of paragraphs) {
    if (used + p.length <= limit) { out.push(p); used += p.length; continue; }
    const room = limit - used;
    if (room > 80 || out.length === 0) {
      const cut = p.slice(0, Math.max(room, 80)).replace(/\s+\S*$/, "");
      out.push(`${cut}…`);
    }
    return { paragraphs: out, truncated: true };
  }
  return { paragraphs: out, truncated: false };
}

export function usableReviews(reviews: CbReview[], max = 4): CommunityReview[] {
  return reviews
    .filter((r) => !r.is_hidden && !r.is_draft && isCommercialLicense(r.license?.id) && (r.text ?? "").trim().length >= 40)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, max)
    .map((r) => {
      const { paragraphs, truncated } = excerpt(plainParagraphs(r.text ?? ""));
      return {
        id: r.id,
        author: r.user?.display_name?.trim() || "A CritiqueBrainz reviewer",
        authorUrl: r.user?.id ? `https://critiquebrainz.org/user/${r.user.id}` : null,
        url: `https://critiquebrainz.org/review/${r.id}`,
        publishedOn: r.published_on ?? r.created ?? r.last_updated ?? null,
        rating: typeof r.rating === "number" && r.rating > 0 ? r.rating : null,
        paragraphs,
        truncated,
        license: { id: r.license!.id!, url: r.license?.info_url || "https://creativecommons.org/licenses/by-sa/3.0/" },
      };
    });
}
