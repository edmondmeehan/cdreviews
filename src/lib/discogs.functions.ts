import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { matchesDiscogsTitle } from "./discogs-match";

const Input = z.object({
  artist: z.string().min(1).max(200),
  album: z.string().min(1).max(200),
});

const cache = new Map<string, { value: unknown; expiresAt: number }>();
const TTL = 24 * 60 * 60 * 1000;

export const lookupDiscogsAlbum = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = `${data.artist}|${data.album}`.toLowerCase().trim();
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value as { ok: true; imageUrl: string; discogsUrl: string; title: string };

    const token = process.env.DISCOGS_TOKEN;
    if (!token) return { ok: false as const, error: "Discogs token not configured" };
    try {
      const params = new URLSearchParams({
        artist: data.artist,
        release_title: data.album,
        per_page: "25",
      });
      const res = await fetch(`https://api.discogs.com/database/search?${params}`, {
        headers: {
          Authorization: `Discogs token=${token}`,
          "User-Agent": "cdreviews/1.0 +https://cdreviews.lovable.app",
        },
      });
      if (!res.ok) return { ok: false as const, error: `Discogs search failed (${res.status})` };
      const json = (await res.json()) as {
        results?: Array<{ title: string; type: string; cover_image?: string; uri?: string }>;
      };
      const candidates = (json.results ?? []).filter(
        (r) => (r.type === "master" || r.type === "release") && r.cover_image && !r.cover_image.includes("spacer.gif")
          && matchesDiscogsTitle(r.title, data.artist, data.album),
      );
      // Prefer master releases (canonical artwork)
      const item = candidates.find((c) => c.type === "master") ?? candidates[0];
      if (!item) return { ok: false as const, error: "No exact artist and album match found on Discogs" };
      const result = {
        ok: true as const,
        imageUrl: item.cover_image!,
        discogsUrl: `https://www.discogs.com${item.uri ?? ""}`,
        title: item.title,
      };
      cache.set(key, { value: result, expiresAt: Date.now() + TTL });
      return result;
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Discogs lookup failed" };
    }
  });
