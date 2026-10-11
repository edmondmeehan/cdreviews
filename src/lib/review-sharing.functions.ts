import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { LEGACY_REVIEW_SLUGS } from "./legacy-redirects";

/** Public, session-free reads: draft data must never reach social crawlers. */
export const getReviewSharing = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => {
    if (typeof data.slug !== "string" || data.slug.length > 250) throw new Error("Invalid review address");
    return { slug: data.slug };
  })
  .handler(async ({ data }) => {
    const request = getRequest();
    const requestUrl = new URL(request.url);
    const forwardedHost = requestUrl.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const origin = forwardedHost ? new URL(`https://${forwardedHost}`).origin : requestUrl.origin;
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Review sharing is unavailable");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const slug = LEGACY_REVIEW_SLUGS[data.slug] ?? data.slug;
    const { data: review, error } = await client.from("reviews")
      .select("slug,title,artist,score,art_url,byline")
      .eq("slug", slug).eq("status", "published").maybeSingle();
    if (error) throw new Error("Unable to load review sharing details");
    return { review, origin };
  });