export type ShareReview = {
  slug: string;
  title: string;
  artist: string;
  score: number;
  art_url: string | null;
  byline: string;
};

/** Crawlers need public, absolute HTTPS artwork, never browser-local URLs. */
export function shareArtworkUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function reviewSharingMeta(review: ShareReview | null, origin: string) {
  if (!review) return { meta: [
    { title: "Review not found — cdreviews." },
    { name: "description", content: "This review is not available in the public cdreviews archive." },
    { property: "og:title", content: "Review not found — cdreviews." },
    { property: "og:description", content: "This review is not available in the public cdreviews archive." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] };
  const scored = Number(review.score) > 0;
  const title = `${review.artist} — ${review.title}${scored ? ` · ${Number(review.score).toFixed(1)}/10` : ""} — cdreviews.`;
  const description = scored
    ? `${review.artist}'s ${review.title}, rated ${Number(review.score).toFixed(1)}/10 by ${review.byline}. Read the review on cdreviews.`
    : `${review.artist}'s ${review.title}, reviewed by ${review.byline}. Read the review on cdreviews.`;
  const image = shareArtworkUrl(review.art_url);
  const url = `${origin}/reviews/${encodeURIComponent(review.slug)}`;
  return {
    links: [{ rel: "canonical", href: url }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "cdreviews." },
      { property: "og:url", content: url },
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(image ? [
        { property: "og:image", content: image },
        { property: "og:image:alt", content: `${review.title} by ${review.artist} — album cover` },
        { name: "twitter:image", content: image },
        { name: "twitter:image:alt", content: `${review.title} by ${review.artist} — album cover` },
      ] : []),
    ],
  };
}