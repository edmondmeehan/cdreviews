import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

export const lookupSpotifyAlbum = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    try {
      const token = await getToken();
      const q = encodeURIComponent(`album:"${data.album}" artist:"${data.artist}"`);
      const res = await fetch(`https://api.spotify.com/v1/search?type=album&limit=1&q=${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { ok: false as const, error: `Spotify search failed (${res.status})` };
      const json = (await res.json()) as {
        albums?: { items?: Array<{
          id: string;
          name: string;
          external_urls?: { spotify?: string };
          images?: Array<{ url: string; width: number; height: number }>;
          artists?: Array<{ name: string }>;
        }> };
      };
      const item = json.albums?.items?.[0];
      if (!item) return { ok: false as const, error: "No matching album found on Spotify" };
      const image = item.images?.sort((a, b) => b.width - a.width)[0]?.url ?? null;
      return {
        ok: true as const,
        albumId: item.id,
        albumName: item.name,
        artistName: item.artists?.map((a) => a.name).join(", ") ?? "",
        spotifyUrl: item.external_urls?.spotify ?? `https://open.spotify.com/album/${item.id}`,
        imageUrl: image,
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Unknown error" };
    }
  });
