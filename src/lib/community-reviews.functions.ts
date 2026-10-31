import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { albumCore } from "./album-match";
import { pickReleaseGroup, usableReviews, type CbReview, type CommunityReview, type MbReleaseGroup } from "./musicbrainz";

export type CommunityBlock = {
  releaseGroupId: string | null;
  musicbrainzUrl: string | null;
  critiquebrainzUrl: string | null;
  averageRating: number | null;
  ratingCount: number;
  reviews: CommunityReview[];
};

const EMPTY: CommunityBlock = { releaseGroupId: null, musicbrainzUrl: null, critiquebrainzUrl: null, averageRating: null, ratingCount: 0, reviews: [] };
const UA = "cdreviews/1.0 ( https://cdreviews.com )";
const RECHECK_UNMATCHED_MS = 30 * 24 * 60 * 60 * 1000;
const REFRESH_REVIEWS_MS = 24 * 60 * 60 * 1000;
const memo = new Map<string, { value: CommunityBlock; expiresAt: number }>();

const quote = (s: string) => `"${s.replace(/[\\"]/g, "\\$&")}"`;

async function getJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(6000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** undefined = MusicBrainz unreachable (try again later); null = no match. */
async function findReleaseGroup(artist: string, album: string): Promise<MbReleaseGroup | null | undefined> {
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

async function fetchCommunity(releaseGroupId: string): Promise<Omit<CommunityBlock, "releaseGroupId" | "musicbrainzUrl" | "critiquebrainzUrl"> | null> {
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

function block(releaseGroupId: string | null, community: Partial<CommunityBlock> | null): CommunityBlock {
  if (!releaseGroupId) return EMPTY;
  return {
    releaseGroupId,
    musicbrainzUrl: `https://musicbrainz.org/release-group/${releaseGroupId}`,
    critiquebrainzUrl: `https://critiquebrainz.org/release-group/${releaseGroupId}`,
    averageRating: community?.averageRating ?? null,
    ratingCount: community?.ratingCount ?? 0,
    reviews: community?.reviews ?? [],
  };
}

/** Public: CritiqueBrainz (MetaBrainz) reader reviews for a published review's album. */
export const getCommunityReviews = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => {
    if (typeof data?.slug !== "string" || !data.slug || data.slug.length > 250) throw new Error("Invalid review address");
    return { slug: data.slug };
  })
  .handler(async ({ data }): Promise<CommunityBlock> => {
    const hit = memo.get(data.slug);
    if (hit && hit.expiresAt > Date.now()) return hit.value;
    const remember = (value: CommunityBlock, ms = 60 * 60 * 1000) => { memo.set(data.slug, { value, expiresAt: Date.now() + ms }); return value; };

    try {
      const { data: review } = await supabaseAdmin.from("reviews")
        .select("id,artist,title").eq("slug", data.slug).eq("status", "published").maybeSingle();
      if (!review) return remember(EMPTY);

      const { data: link } = await supabaseAdmin.from("musicbrainz_links").select("*").eq("review_id", review.id).maybeSingle();
      let releaseGroupId = link?.release_group_id ?? null;
      const now = Date.now();

      const needsLookup = !link || (!releaseGroupId && now - new Date(link.checked_at).getTime() > RECHECK_UNMATCHED_MS);
      if (needsLookup) {
        const found = await findReleaseGroup(review.artist, review.title);
        if (found === undefined) return remember(block(releaseGroupId, link?.community as Partial<CommunityBlock> | null), 10 * 60 * 1000);
        releaseGroupId = found?.id ?? null;
        await supabaseAdmin.from("musicbrainz_links").upsert({
          review_id: review.id, release_group_id: releaseGroupId, matched_title: found?.title ?? null,
          checked_at: new Date().toISOString(), community: null, fetched_at: null,
        });
        if (!releaseGroupId) return remember(EMPTY, 6 * 60 * 60 * 1000);
      }

      const stale = needsLookup || !link?.fetched_at || now - new Date(link.fetched_at).getTime() > REFRESH_REVIEWS_MS;
      if (!stale) return remember(block(releaseGroupId, link?.community as Partial<CommunityBlock> | null));

      const fresh = await fetchCommunity(releaseGroupId!);
      if (!fresh) return remember(block(releaseGroupId, needsLookup ? null : (link?.community as Partial<CommunityBlock> | null)), 10 * 60 * 1000);
      await supabaseAdmin.from("musicbrainz_links")
        .update({ community: fresh as unknown as Json, fetched_at: new Date().toISOString() })
        .eq("review_id", review.id);
      return remember(block(releaseGroupId, fresh));
    } catch (e) {
      console.error("[community-reviews]", e);
      return remember(EMPTY, 5 * 60 * 1000);
    }
  });
