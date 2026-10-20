import { albumTitleScore, artistMatches } from "./album-match";

/** Discogs search result titles look like "Artist - Album". 0 = not this record; higher = closer. */
export function discogsTitleScore(resultTitle: string, artist: string, album: string): number {
  const idx = resultTitle.indexOf(" - ");
  if (idx < 0) return 0;
  const rArtist = resultTitle.slice(0, idx);
  const rAlbum = resultTitle.slice(idx + 3);
  if (!artistMatches([rArtist], artist)) return 0;
  return albumTitleScore(rAlbum, album, artist);
}

/** Both the artist and the album must match (allowing edition/spelling variations). */
export function matchesDiscogsTitle(resultTitle: string, artist: string, album: string): boolean {
  return discogsTitleScore(resultTitle, artist, album) > 0;
}
