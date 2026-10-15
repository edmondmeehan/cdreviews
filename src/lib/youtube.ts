/** Parse video links only; never pass arbitrary editor URLs to an iframe. */
export function youtubeVideoId(value?: string): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length === 1) id = parts[0];
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else {
        const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/);
        id = match?.[1] ?? null;
      }
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function normalizeYoutubeUrl(value?: string): string | undefined {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : undefined;
}