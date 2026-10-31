// Server-only: MusicBrainz matching + CritiqueBrainz fetching, shared by the public
// "From the community" block and the admin Community reviews page.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { albumCore } from "@/lib/album-match";
import { pickReleaseGroup, usableReviews, type CbReview, type CommunityReview, type MbReleaseGroup } from "@/lib/musicbrainz";

export type CommunityBlock = {
  releaseGroupId: string | null;
  musicbrainzUrl: string | null;
  critiquebrainzUrl: string | null;
  averageRating: number | null;
  ratingCount: number;
  reviews: CommunityReview[];
};
export type CommunityData = Pick<CommunityBlock, "averageRating" | "ratingCount" | "reviews">;

export const EMPTY_BLOCK: CommunityBlock = { releaseGroupId: null, musicbrainzUrl: null, critiquebrainzUrl: null, averageRating: null, ratingCount: 0, reviews: [] };
/** An editor said "no match": checked_at far in the future so automatic re-checks never override it. */
export const EDITOR_NO_MATCH_AT = "9999-12-31T00:00:00.000Z";
export const isEditorNoMatch = (checkedAt: string | null | undefined) => !!checkedAt && checkedAt.startsWith("9999");

const UA = "cdreviews/1.0 ( https://cdreviews.com )";
const quote = (s: string) => `"${s.replace(/[\\"]/g, "\\$&")}"`;

/** Per-instance page cache, cleared when an editor changes a match. */
export const memo = new Map<string, { value: CommunityBlock; expiresAt: number }>();

async function getJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(6000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** undefined = MusicBrainz unreachable (try again later); null = no match. */
export async function findReleaseGroup(artist: string, album: string): Promise<MbReleaseGroup | null | undefined> {
  const queries = [`releasegroup:${quote(album)} AND artist:${quote(artist)}`];
  const core = albumCore(album);
  if (core && core !== album.toLowerCase()) queries.push(`releasegroup:${quote(core)} AND artist:${quote(artist)}`);
  let reached = false;
  for (const q of queries) {
    const json = (await getJson(`https://musicbrainz.org/ws/2/release-group/?fmt=json&limit=15&query=${encodeURIComponent(q)}`)) as
      { "release-groups"?: MbReleaseGroup[] } | null;
    if (!json) continue;
    reached = true;
    const hit = pickReleaseGroup(json["release-groups"] ?? [], artist, album);
    if (hit) return hit;
  }
  return reached ? null : undefined;
}

/** Title of a release group by id; undefined when MusicBrainz can't be reached, null when it doesn't exist. */
export async function releaseGroupTitle(id: string): Promise<string | null | undefined> {
  try {
    const res = await fetch(`https://musicbrainz.org/ws/2/release-group/${id}?fmt=json&inc=artist-credits`, {
      headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(6000),
    });
    if (res.status === 404 || res.status === 400) return null;
    if (!res.ok) return undefined;
    const json = (await res.json()) as { title?: string; "artist-credit"?: Array<{ name?: string }> };
    const artist = (json["artist-credit"] ?? []).map((c) => c.name ?? "").join(" ").trim();
    return json.title ? (artist ? `${artist} — ${json.title}` : json.title) : null;
  } catch {
    return undefined;
  }
}

export async function fetchCommunity(releaseGroupId: string): Promise<CommunityData | null> {
  const params = new URLSearchParams({ entity_id: releaseGroupId, entity_type: "release_group", sort: "popularity", limit: "50" });
  const json = (await getJson(`https://critiquebrainz.org/ws/1/review/?${params}`)) as
    { reviews?: CbReview[]; average_rating?: number | { rating?: number; count?: number } | null; ratings_stats?: Record<string, number> } | null;
  if (!json) return null;
  const avg = json.average_rating;
  const averageRating = typeof avg === "number" ? avg : typeof avg?.rating === "number" ? avg.rating : null;
  const ratingCount = typeof avg === "object" && avg && typeof avg.count === "number"
    ? avg.count
    : Object.values(json.ratings_stats ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);
  return { averageRating: averageRating && averageRating > 0 ? Math.round(averageRating * 10) / 10 : null, ratingCount, reviews: usableReviews(json.reviews ?? []) };
}

export function toBlock(releaseGroupId: string | null, community: Partial<CommunityData> | null): CommunityBlock {
  if (!releaseGroupId) return EMPTY_BLOCK;
  return {
    releaseGroupId,
    musicbrainzUrl: `https://musicbrainz.org/release-group/${releaseGroupId}`,
    critiquebrainzUrl: `https://critiquebrainz.org/release-group/${releaseGroupId}`,
    averageRating: community?.averageRating ?? null,
    ratingCount: community?.ratingCount ?? 0,
    reviews: community?.reviews ?? [],
  };
}

/** Save a match (or no-match) and, when matched, pull its reviews right away. */
export async function saveMatch(reviewId: string, match: { id: string | null; title: string | null; checkedAt?: string }) {
  const community = match.id ? await fetchCommunity(match.id) : null;
  const { error } = await supabaseAdmin.from("musicbrainz_links").upsert({
    review_id: reviewId,
    release_group_id: match.id,
    matched_title: match.title,
    checked_at: match.checkedAt ?? new Date().toISOString(),
    community: (community as unknown as Json) ?? null,
    fetched_at: community ? new Date().toISOString() : null,
  });
  if (error) throw new Error(error.message);
  return community;
}
