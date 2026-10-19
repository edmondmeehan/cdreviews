import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SITE_URL = "https://www.cdreviews.com";
const SITE_TITLE = "cdreviews.";
const SITE_DESC = "Album criticism, scores, and listening from the cdreviews archive.";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const Route = createFileRoute("/api/public/rss.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient<Database>(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const { data: reviews, error } = await supabase
          .from("reviews")
          .select("slug, title, artist, label, genre, score, byline, date, updated_at, art_url, body")
          .eq("status", "published")
          .order("updated_at", { ascending: false })
          .limit(50);
        if (error) console.error("[rss] reviews query failed:", error.message);

        const items = (reviews ?? [])
          .map((r) => {
            const link = `${SITE_URL}/reviews/${r.slug}`;
            const pubDate = r.updated_at ? new Date(r.updated_at).toUTCString() : "";
            const paras = Array.isArray(r.body) ? (r.body as unknown[]).filter((p): p is string => typeof p === "string") : [];
            const excerpt = paras.slice(0, 2).join(" ").slice(0, 600);
            const img = r.art_url && r.art_url.startsWith("https://") ? r.art_url : "";
            const meta = `${r.artist} — ${r.title} (${r.label}). ${Number(r.score) > 0 ? `Scored ${Number(r.score).toFixed(1)}/10` : "Not scored"} by ${r.byline}.`;
            const desc = `${img ? `<img src="${img}" alt="" width="600"/>` : ""}<p><strong>${esc(meta)}</strong></p>${excerpt ? `<p>${esc(excerpt)}…</p>` : ""}`;
            return `    <item>
      <title>${esc(`${r.artist} — ${r.title}`)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      <description><![CDATA[${desc}]]></description>
      ${img ? `<enclosure url="${esc(img)}" type="image/jpeg" length="0"/>` : ""}
      <dc:creator>${esc(r.byline)}</dc:creator>
      ${r.genre && r.genre !== "Uncategorized" ? `<category>${esc(r.genre)}</category>` : ""}
    </item>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <atom:link href="${SITE_URL}/api/public/rss.xml" rel="self" type="application/rss+xml"/>
    <title>${esc(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
        });
      },
    },
  },
});
