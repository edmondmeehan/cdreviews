import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SITE_URL = "https://cdreviews.lovable.app";
const SITE_TITLE = "cdreviews.";
const SITE_DESC = "Album criticism, scores, and listening from the cdreviews archive.";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const Route = createFileRoute("/api/public/rss/xml")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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

        const { data: reviews } = await supabase
          .from("reviews")
          .select("slug, title, artist, label, genre, score, byline, date, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(50);

        const items = (reviews ?? [])
          .map((r) => {
            const link = `${SITE_URL}/reviews/${r.slug}`;
            const pubDate = r.published_at ? new Date(r.published_at).toUTCString() : "";
            const desc = `${r.artist} — ${r.title} (${r.label}). Scored ${Number(r.score).toFixed(1)}/10 by ${r.byline}.`;
            return `    <item>
      <title>${esc(`${r.artist} — ${r.title}`)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      <description>${esc(desc)}</description>
      ${r.genre && r.genre !== "Uncategorized" ? `<category>${esc(r.genre)}</category>` : ""}
    </item>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
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
