export type SpotifyCandidate = {
  name: string;
  artists?: Array<{ id: string; name: string }>;
};

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

export function matchesSpotifyAlbum(item: SpotifyCandidate, artist: string, title: string): boolean {
  if (normalize(item.name) !== normalize(title)) return false;
  const names = item.artists?.map((entry) => entry.name) ?? [];
  return names.some((name) => normalize(name) === normalize(artist)) ||
    (names.length > 0 && normalize(names.join(", ")) === normalize(artist));
}