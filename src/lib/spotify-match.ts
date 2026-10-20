import { albumTitleScore, artistMatches } from "./album-match";

export type SpotifyCandidate = {
  name: string;
  artists?: Array<{ id: string; name: string }>;
};

/** 0 = not this record; higher = closer title match. Artist must match either way. */
export function spotifyAlbumScore(item: SpotifyCandidate, artist: string, title: string): number {
  const names = item.artists?.map((entry) => entry.name) ?? [];
  if (!artistMatches(names, artist)) return 0;
  return albumTitleScore(item.name, title, artist);
}

export function matchesSpotifyAlbum(item: SpotifyCandidate, artist: string, title: string): boolean {
  return spotifyAlbumScore(item, artist, title) > 0;
}

/** Best-scoring candidate (earliest wins ties, keeping Spotify's relevance order). */
export function bestSpotifyAlbum<T extends SpotifyCandidate>(items: T[], artist: string, title: string): T | undefined {
  let best: T | undefined;
  let bestScore = 0;
  for (const item of items) {
    const s = spotifyAlbumScore(item, artist, title);
    if (s > bestScore) { best = item; bestScore = s; }
  }
  return best;
}
