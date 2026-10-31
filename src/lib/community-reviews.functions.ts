import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import {
  EMPTY_BLOCK, fetchCommunity, findReleaseGroup, memo, saveMatch, toBlock,
  type CommunityBlock, type CommunityData,
} from "@/server/community.server";

export type { CommunityBlock } from "@/server/community.server";

const RECHECK_UNMATCHED_MS = 30 * 24 * 60 * 60 * 1000;
const REFRESH_REVIEWS_MS = 24 * 60 * 60 * 1000;

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
      if (!review) return remember(EMPTY_BLOCK);

      const { data: link } = await supabaseAdmin.from("musicbrainz_links").select("*").eq("review_id", review.id).maybeSingle();
      const cached = (link?.community ?? null) as Partial<CommunityData> | null;
      const now = Date.now();

      // Automatic matching. Never re-checks a match an editor set (or an editor's "no match").
      if (!link || (!link.release_group_id && now - new Date(link.checked_at).getTime() > RECHECK_UNMATCHED_MS)) {
        const found = await findReleaseGroup(review.artist, review.title);
        if (found === undefined) return remember(EMPTY_BLOCK, 10 * 60 * 1000);
        const community = await saveMatch(review.id, { id: found?.id ?? null, title: found?.title ?? null });
        return remember(toBlock(found?.id ?? null, community), found ? 60 * 60 * 1000 : 6 * 60 * 60 * 1000);
      }

      const releaseGroupId = link.release_group_id;
      if (!releaseGroupId) return remember(EMPTY_BLOCK, 6 * 60 * 60 * 1000);
      if (link.fetched_at && now - new Date(link.fetched_at).getTime() <= REFRESH_REVIEWS_MS) return remember(toBlock(releaseGroupId, cached));

      const fresh = await fetchCommunity(releaseGroupId);
      if (!fresh) return remember(toBlock(releaseGroupId, cached), 10 * 60 * 1000);
      await supabaseAdmin.from("musicbrainz_links")
        .update({ community: fresh as unknown as Json, fetched_at: new Date().toISOString() })
        .eq("review_id", review.id);
      return remember(toBlock(releaseGroupId, fresh));
    } catch (e) {
      console.error("[community-reviews]", e);
      return remember(EMPTY_BLOCK, 5 * 60 * 1000);
    }
  });
