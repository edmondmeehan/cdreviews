export const AMAZON_AFFILIATE_TAG = "cdreviews-20";

/** Amazon search link for an album, tagged with the cdreviews affiliate ID. */
export function amazonSearchUrl(artist: string, album: string): string {
  const params = new URLSearchParams({ k: `${artist} ${album}`.trim(), i: "popular", tag: AMAZON_AFFILIATE_TAG });
  return `https://www.amazon.com/s?${params}`;
}
