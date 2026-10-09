import type { Review } from "@/lib/cd-data";

/**
 * Album cover renderer.
 * - The sleeve shows the uploaded/Spotify artUrl when there is one, otherwise a
 *   CSS-art placeholder with the title/artist set in big type.
 * - An iridescent CD sits tucked behind the sleeve. With `pop`, it slides out
 *   when the nearest `.group` ancestor is hovered.
 * - `mini` is for thumbnails: no disc, compact placeholder type.
 */
export function Cover({
  r,
  className = "",
  pop = false,
  mini = false,
}: {
  r: Pick<Review, "art" | "artUrl" | "title" | "artist">;
  className?: string;
  pop?: boolean;
  mini?: boolean;
}) {
  const sleeve = r.artUrl ? (
    <img
      src={r.artUrl}
      alt={`${r.title} cover`}
      loading="lazy"
      className="cover__sleeve w-full h-full object-cover"
    />
  ) : (
    <div className={`cover__sleeve art ${r.art} cover-fallback`} role="img" aria-label={`${r.title} by ${r.artist}`}>
      <div className="cover-fallback__sleeve">
        <div className="cover-fallback__title">{r.title}</div>
        <div className="cover-fallback__artist">{r.artist}</div>
      </div>
    </div>
  );

  return (
    <div className={`cover ${pop ? "cover--pop" : ""} ${mini ? "cover--mini" : ""} ${className}`}>
      {!mini && <div className="cover__disc cd-disc" aria-hidden="true" />}
      {sleeve}
    </div>
  );
}
