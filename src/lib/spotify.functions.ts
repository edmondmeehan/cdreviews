import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { matchesSpotifyAlbum } from "./spotify-match";

const Input = z.object({
  artist: z.string().min(1).max(200),
  album: z.string().min(1).max(200),
});

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) return cachedToken.token;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Spotify credentials not configured");
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

function pickBestImage(images?: Array<{ url: string; width?: number; height?: number }>): string | null {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0]?.url ?? null;
}

// In-memory cache for Spotify lookups (per-worker instance).
// TTL keeps entries fresh enough that artwork updates eventually propagate.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_CACHE_ENTRIES = 500;

type CacheEntry<T> = { value: T; expiresAt: number };
const lookupCache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | null {
  const hit = lookupCache.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    lookupCache.delete(key);
    return null;
  }
  // refresh LRU order
  lookupCache.delete(key);
  lookupCache.set(key, hit);
  return hit.value as T;
}

function cacheSet<T>(key: string, value: T) {
  if (lookupCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = lookupCache.keys().next().value;
    if (oldest !== undefined) lookupCache.delete(oldest);
  }
  lookupCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function normKey(...parts: string[]): string {
  return parts.map((p) => p.trim().toLowerCase().replace(/\s+/g, " ")).join("|");
}

// Request coalescing: concurrent calls with the same key share one in-flight Promise.
// Entries have a TTL guard so a hung handler can't pin a key in the map forever.
const INFLIGHT_TTL_MS = 30_000;
const INFLIGHT_SWEEP_MS = 60_000;

type InflightEntry = { promise: Promise<unknown>; expiresAt: number };
const inflight = new Map<string, InflightEntry>();

function sweepInflight() {
  const now = Date.now();
  for (const [k, v] of inflight) {
    if (v.expiresAt <= now) inflight.delete(k);
  }
}

let sweepTimer: ReturnType<typeof setInterval> | null = null;
function ensureSweeper() {
  if (sweepTimer) return;
  sweepTimer = setInterval(sweepInflight, INFLIGHT_SWEEP_MS);
  (sweepTimer as unknown as { unref?: () => void })?.unref?.();
}

function coalesce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.promise as Promise<T>;
  }
  if (existing) inflight.delete(key);
  ensureSweeper();
  const p = (async () => {
    try {
      return await fn();
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, { promise: p, expiresAt: Date.now() + INFLIGHT_TTL_MS });
  return p;
}

export const lookupSpotifyAlbum = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const cacheKey = normKey("album-exact-v2", data.artist, data.album);
    const cached = cacheGet<{
      ok: true; albumId: string; albumName: string; artistId: string | null;
      artistName: string; spotifyUrl: string; imageUrl: string | null;
    }>(cacheKey);
    if (cached) return cached;

    return coalesce(cacheKey, async () => {
      // re-check cache in case another caller resolved while we were queued
      const fresh = cacheGet<{
        ok: true; albumId: string; albumName: string; artistId: string | null;
        artistName: string; spotifyUrl: string; imageUrl: string | null;
      }>(cacheKey);
      if (fresh) return fresh;
      try {
        const token = await getToken();
        const q = encodeURIComponent(`album:"${data.album}" artist:"${data.artist}"`);
        const res = await fetch(`https://api.spotify.com/v1/search?type=album&limit=20&q=${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { ok: false as const, error: `Spotify search failed (${res.status})` };
        const json = (await res.json()) as {
          albums?: { items?: Array<{
            id: string;
            name: string;
            external_urls?: { spotify?: string };
            images?: Array<{ url: string; width: number; height: number }>;
            artists?: Array<{ id: string; name: string }>;
          }> };
        };
        const item = json.albums?.items?.find((candidate) => matchesSpotifyAlbum(candidate, data.artist, data.album));
        if (!item) return { ok: false as const, error: "No exact artist and album match found on Spotify", mismatch: true as const };
        const image = pickBestImage(item.images);
        const result = {
          ok: true as const,
          albumId: item.id,
          albumName: item.name,
          artistId: item.artists?.[0]?.id ?? null,
          artistName: item.artists?.map((a) => a.name).join(", ") ?? "",
          spotifyUrl: item.external_urls?.spotify ?? `https://open.spotify.com/album/${item.id}`,
          imageUrl: image,
        };
        cacheSet(cacheKey, result);
        return result;
      } catch (e) {
        return { ok: false as const, error: e instanceof Error ? e.message : "Unknown error" };
      }
    });
  });

const SearchInput = z.object({ query: z.string().min(1).max(200) });

export const searchSpotifyAlbums = createServerFn({ method: "POST" })
  .inputValidator((d) => SearchInput.parse(d))
  .handler(async ({ data }) => {
    const cacheKey = normKey("search", data.query);
    type SearchOk = {
      ok: true; results: Array<{
        albumId: string; albumName: string; artistId: string | null; artistName: string;
        releaseDate: string; totalTracks: number; spotifyUrl: string; imageUrl: string | null;
      }>;
    };
    const cached = cacheGet<SearchOk>(cacheKey);
    if (cached) return cached;

    return coalesce(cacheKey, async () => {
      const fresh = cacheGet<SearchOk>(cacheKey);
      if (fresh) return fresh;
      try {
        const token = await getToken();
        const q = encodeURIComponent(data.query);
        const res = await fetch(`https://api.spotify.com/v1/search?type=album&limit=12&q=${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { ok: false as const, error: `Spotify search failed (${res.status})`, results: [] };
        const json = (await res.json()) as {
          albums?: { items?: Array<{
            id: string;
            name: string;
            release_date?: string;
            total_tracks?: number;
            external_urls?: { spotify?: string };
            images?: Array<{ url: string; width: number; height: number }>;
            artists?: Array<{ id: string; name: string }>;
          }> };
        };
        const results = (json.albums?.items ?? []).map((item) => ({
          albumId: item.id,
          albumName: item.name,
          artistId: item.artists?.[0]?.id ?? null,
          artistName: item.artists?.map((a) => a.name).join(", ") ?? "",
          releaseDate: item.release_date ?? "",
          totalTracks: item.total_tracks ?? 0,
          spotifyUrl: item.external_urls?.spotify ?? `https://open.spotify.com/album/${item.id}`,
          imageUrl: pickBestImage(item.images),
        }));
        const out = { ok: true as const, results };
        cacheSet(cacheKey, out);
        return out;
      } catch (e) {
        return { ok: false as const, error: e instanceof Error ? e.message : "Unknown error", results: [] };
      }
    });
  });
