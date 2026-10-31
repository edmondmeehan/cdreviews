import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { parseReleaseGroupId } from "./musicbrainz";
import {
  EDITOR_NO_MATCH_AT, findReleaseGroup, isEditorNoMatch, memo, releaseGroupTitle, saveMatch,
  type CommunityData,
} from "@/server/community.server";

async function assertStaff(supabase: SupabaseClient<Database>, userId: string) {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Editor or admin role required.");
}

export type CommunityRow = {
  reviewId: string;
  slug: string;
  artist: string;
  title: string;
  state: "unchecked" | "matched" | "nomatch" | "hidden";
  releaseGroupId: string | null;
  matchedTitle: string | null;
  checkedAt: string | null;
  reviewCount: number;
  rating: number | null;
  ratingCount: number;
};

/** Every published review with its MusicBrainz match and community counts. */
export const listCommunityMatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunityRow[]> => {
    await assertStaff(context.supabase, context.userId);
    const reviews: Array<{ id: string; slug: string; artist: string; title: string }> = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabaseAdmin.from("reviews").select("id,slug,artist,title")
        .eq("status", "published").order("artist").range(from, from + 999);
      if (error) throw new Error(error.message);
      reviews.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    const links = new Map<string, Database["public"]["Tables"]["musicbrainz_links"]["Row"]>();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabaseAdmin.from("musicbrainz_links").select("*").range(from, from + 999);
      if (error) throw new Error(error.message);
      for (const l of data ?? []) links.set(l.review_id, l);
      if (!data || data.length < 1000) break;
    }
    return reviews.map((r) => {
      const l = links.get(r.id);
      const c = (l?.community ?? null) as Partial<CommunityData> | null;
      return {
        reviewId: r.id, slug: r.slug, artist: r.artist, title: r.title,
        state: !l ? "unchecked" : l.release_group_id ? "matched" : isEditorNoMatch(l.checked_at) ? "hidden" : "nomatch",
        releaseGroupId: l?.release_group_id ?? null,
        matchedTitle: l?.matched_title ?? null,
        checkedAt: l && !isEditorNoMatch(l.checked_at) ? l.checked_at : null,
        reviewCount: c?.reviews?.length ?? 0,
        rating: c?.averageRating ?? null,
        ratingCount: c?.ratingCount ?? 0,
      };
    });
  });

async function slugFor(reviewId: string) {
  const { data } = await supabaseAdmin.from("reviews").select("slug,artist,title").eq("id", reviewId).maybeSingle();
  if (!data) throw new Error("Review not found");
  return data;
}

const SetInput = z.object({
  reviewId: z.string().uuid(),
  action: z.enum(["set", "hide", "recheck"]),
  value: z.string().max(300).optional(),
});

/** Editor actions: set the MusicBrainz album by hand, hide the section, or re-run automatic matching. */
export const updateCommunityMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => SetInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const review = await slugFor(data.reviewId);
    memo.delete(review.slug);

    if (data.action === "hide") {
      await saveMatch(data.reviewId, { id: null, title: null, checkedAt: EDITOR_NO_MATCH_AT });
      return { ok: true as const, message: "Community section hidden for this review." };
    }

    if (data.action === "set") {
      const id = parseReleaseGroupId(data.value ?? "");
      if (!id) throw new Error("Paste a MusicBrainz release-group link (musicbrainz.org/release-group/…) or its ID.");
      const title = await releaseGroupTitle(id);
      if (title === null) throw new Error("MusicBrainz has no release group with that ID — check it's a release-group link, not a release or recording.");
      const community = await saveMatch(data.reviewId, { id, title: title ?? null });
      return { ok: true as const, message: `Matched to ${title ?? id}. ${community ? `${community.reviews.length} review(s) found.` : "Reviews will load on the next page view."}` };
    }

    const found = await findReleaseGroup(review.artist, review.title);
    if (found === undefined) throw new Error("MusicBrainz didn't respond — try again in a minute.");
    const community = await saveMatch(data.reviewId, { id: found?.id ?? null, title: found?.title ?? null });
    return {
      ok: true as const,
      message: found ? `Matched to ${found.title}. ${community?.reviews.length ?? 0} review(s) found.` : "No confident match on MusicBrainz — set one by hand if you know it.",
    };
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Match the next few unchecked reviews (MusicBrainz allows about one lookup a second). */
export const matchUncheckedBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { limit?: number }) => ({ limit: Math.min(Math.max(Number(d?.limit) || 10, 1), 15) }))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: links } = await supabaseAdmin.from("musicbrainz_links").select("review_id");
    const done = new Set((links ?? []).map((l) => l.review_id));
    const todo: Array<{ id: string; artist: string; title: string }> = [];
    for (let from = 0; todo.length < data.limit; from += 1000) {
      const { data: rows } = await supabaseAdmin.from("reviews").select("id,artist,title")
        .eq("status", "published").order("artist").range(from, from + 999);
      for (const r of rows ?? []) if (!done.has(r.id) && todo.length < data.limit) todo.push(r);
      if (!rows || rows.length < 1000) break;
    }
    let matched = 0, unmatched = 0, failed = 0;
    for (const [i, r] of todo.entries()) {
      if (i > 0) await sleep(1100);
      const found = await findReleaseGroup(r.artist, r.title);
      if (found === undefined) { failed++; continue; }
      await saveMatch(r.id, { id: found?.id ?? null, title: found?.title ?? null });
      if (found) matched++; else unmatched++;
    }
    return { checked: todo.length, matched, unmatched, failed };
  });
