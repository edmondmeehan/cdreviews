function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

/** Discogs disambiguates duplicate artist names with " (2)", and may prefix "The"/use "*". */
function cleanArtist(value: string): string {
  return normalize(value.replace(/\s*\(\d+\)\s*$/, "").replace(/\*$/, ""));
}

/** Discogs search result titles look like "Artist - Album". Both parts must match exactly. */
export function matchesDiscogsTitle(resultTitle: string, artist: string, album: string): boolean {
  const idx = resultTitle.indexOf(" - ");
  if (idx < 0) return false;
  const rArtist = resultTitle.slice(0, idx);
  const rAlbum = resultTitle.slice(idx + 3);
  return cleanArtist(rArtist) === cleanArtist(artist) && normalize(rAlbum) === normalize(album);
}
