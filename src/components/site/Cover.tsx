import type { Review } from "@/lib/cd-data";

/**
 * Album cover renderer.
 * - If the review has an uploaded/Spotify artUrl, show that real image.
 * - Otherwise render a vinyl-style fallback that includes the title/artist
 *   so the placeholder doesn't look like a generic colored block.
 */
export function Cover({
  r,
  className = "",
}: {
  r: Pick<Review, "art" | "artUrl" | "title" | "artist">;
  className?: string;
}) {
  if (r.artUrl) {
    return (
      <img
        src={r.artUrl}
        alt={`${r.title} cover`}
        loading="lazy"
        className={`w-full aspect-square object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`art ${r.art} cover-fallback ${className}`}>
      <div className="cover-fallback__sleeve">
        <div className="cover-fallback__title">{r.title}</div>
        <div className="cover-fallback__artist">{r.artist}</div>
      </div>
    </div>
  );
}
