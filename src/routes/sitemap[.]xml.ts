import type { AnyRoute } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import {
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  type SitemapEntry,
} from "@/lib/sitemap";

const BASE_URL = "https://cdreviews.com";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        // Public content pages (published reviews, features, lists, author bylines)
        // come from the database through the public publishable client, paginated.
        const { createClient } = await import("@supabase/supabase-js");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient(process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              // Opaque sb_ keys are not JWTs; send apikey without the default bearer.
              if (key.startsWith("sb_") && headers.get("Authorization") === "Bearer " + key) {
                headers.delete("Authorization");
              }
              headers.set("apikey", key);
              return fetch(input, { ...init, headers });
            },
          },
        });

        const pushLocation = (routeId: string, to: string, params: Record<string, string>) => {
          const route = (router.routesById as unknown as Record<string, AnyRoute | undefined>)[routeId];
          if (!isSitemapRouteIncluded(route)) return;
          const location = router.buildLocation({ to, params, search: () => ({}), hash: "" });
          const path = sitemapPathForLocation(router, location, routeId);
          if (path) entries.push({ path });
        };

        const pageSize = 1000;
        const bylines = new Set<string>();

        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await supabase
            .from("reviews")
            .select("slug, byline, updated_at")
            .eq("status", "published")
            .order("id")
            .range(offset, offset + pageSize - 1);
          if (error) throw new Error(`Sitemap reviews query failed: ${error.message}`);
          if (!data || data.length === 0) break;
          for (const row of data) {
            pushLocation("/reviews/$slug", "/reviews/$slug", { slug: row.slug });
            if (row.byline) bylines.add(row.byline);
          }
          if (data.length < pageSize) break;
        }

        for (const byline of bylines) {
          const slug = byline.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          if (slug) pushLocation("/authors/$name", "/authors/$name", { name: slug });
        }

        for (const [routeId, table] of [
          ["/features/$slug", "features"],
          ["/lists/$slug", "lists"],
        ] as const) {
          for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await supabase
              .from(table)
              .select("slug")
              .eq("status", "published")
              .order("id")
              .range(offset, offset + pageSize - 1);
            if (error) throw new Error(`Sitemap ${table} query failed: ${error.message}`);
            if (!data || data.length === 0) break;
            for (const row of data) {
              if (row.slug) pushLocation(routeId, routeId, { slug: row.slug });
            }
            if (data.length < pageSize) break;
          }
        }

        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions. Setting "exclude-subtree" on the root excludes the entire site.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
