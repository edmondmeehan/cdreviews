import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { matchesDiscogsTitle } from "./discogs-match";

async function discogsFetch(url: string, auth: string): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { Authorization: auth, "User-Agent": "cdreviews/1.0 +https://www.cdreviews.com" } });
    if (res.status !== 429 || attempt >= 2) return res;
    const wait = Math.min(Number(res.headers.get("Retry-After")) || 0, 10) * 1000 || 2000 * (attempt + 1);
    await new Promise((r) => setTimeout(r, wait));
  }
}

function discogsError(status: number) {
  return status === 429 ? "Discogs is busy (too many lookups in a minute) — wait a minute and try again" : `Discogs search failed (${status})`;
}

function discogsAuth(): string | null {
  const key = process.env.DISCOGS_CONSUMER_KEY;
  const secret = process.env.DISCOGS_CONSUMER_SECRET;
  if (key && secret) return `Discogs key=${key}, secret=${secret}`;
  const token = process.env.DISCOGS_TOKEN;
  return token ? `Discogs token=${token}` : null;
}

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

    const auth = discogsAuth();
    if (!auth) return { ok: false as const, error: "Discogs is not configured" };
    try {
      const params = new URLSearchParams({
        artist: data.artist,
        release_title: data.album,
        per_page: "25",
      });
      const res = await discogsFetch(`https://api.discogs.com/database/search?${params}`, auth);
      if (!res.ok) return { ok: false as const, error: discogsError(res.status) };
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

const SearchInput = z.object({ query: z.string().min(1).max(200) });

export type DiscogsSearchItem = {
  id: number; title: string; year?: string; label?: string; genre?: string;
  format?: string; country?: string; imageUrl?: string; discogsUrl: string;
};

export const searchDiscogsReleases = createServerFn({ method: "POST" })
  .inputValidator((d) => SearchInput.parse(d))
  .handler(async ({ data }) => {
    const auth = discogsAuth();
    if (!auth) return { ok: false as const, error: "Discogs is not configured" };
    try {
      const params = new URLSearchParams({ q: data.query, per_page: "15" });
      const res = await discogsFetch(`https://api.discogs.com/database/search?${params}`, auth);
      if (!res.ok) return { ok: false as const, error: discogsError(res.status) };
      const json = (await res.json()) as { results?: Array<{
        id: number; type: string; title: string; year?: string; label?: string[]; genre?: string[]; style?: string[];
        format?: string[]; country?: string; cover_image?: string; uri?: string;
      }> };
      const results: DiscogsSearchItem[] = (json.results ?? [])
        .filter((r) => r.type === "master" || r.type === "release")
        .map((r) => ({
          id: r.id, title: r.title, year: r.year, label: r.label?.[0],
          genre: (r.style?.[0] ?? r.genre?.[0]) || undefined,
          format: r.format?.slice(0, 3).join(", "), country: r.country,
          imageUrl: r.cover_image && !r.cover_image.includes("spacer.gif") ? r.cover_image : undefined,
          discogsUrl: `https://www.discogs.com${r.uri ?? ""}`,
        }));
      return { ok: true as const, results };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Discogs search failed" };
    }
  });
