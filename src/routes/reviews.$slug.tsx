import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Kicker, ReviewCard } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";
import { LEGACY_REVIEW_SLUGS } from "@/lib/legacy-redirects";

export const Route = createFileRoute("/reviews/$slug")({
  component: ReviewPage,
  notFoundComponent: NotFound,
});

function NotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="bg-bone min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-[820px] mx-auto px-6 py-24 space-y-6">
        <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">§ 404 · Off the shelf</div>
        <h1 className="fr-display text-[64px] md:text-[88px] text-ink">Review not found.</h1>
        <p className="fr-dek text-[19px] text-ink-2 max-w-[55ch]">
          We don't have a review at <span className="font-mono text-ink">/reviews/{slug}</span>. It may have been retitled, unpublished, or never existed.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/reviews" className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-bone px-5 py-3 hover:bg-ink">→ All reviews</Link>
          <Link to="/archive" className="font-mono text-[11px] tracking-[0.25em] uppercase border border-rule px-5 py-3 hover:bg-bone-2">Search the archive</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ReviewPage() {
  const { slug } = Route.useParams();
  const review = useCdStore((s) => s.reviews.find((r) => r.slug === slug));
  const related = useCdStore((s) => s.reviews.filter((r) => r.slug !== slug && r.genre === review?.genre).slice(0, 4));

  if (!review) {
    const redirectSlug = LEGACY_REVIEW_SLUGS[slug];
    if (redirectSlug) return <Navigate to="/reviews/$slug" params={{ slug: redirectSlug }} replace />;
    return <NotFound />;
  }
  const badge = review.kind === "bnm" ? "BEST NEW MUSIC" : review.kind === "bnr" ? "BEST NEW REISSUE" : null;

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />

      <article className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <header className="lg:col-span-7 space-y-6">
            {badge && <Kicker color="vermil">{badge}</Kicker>}
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">{review.artist}</div>
            <h1 className="fr-display text-[64px] md:text-[96px] text-ink">{review.title}</h1>
            {review.pull && (
              <p className="fr-pull text-[26px] md:text-[34px] text-ink-2 max-w-[28ch] border-l-2 border-vermil pl-5">
                “{review.pull}”
              </p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.2em] uppercase text-mute border-y border-rule py-3">
              <span>By <span className="text-ink">{review.byline}</span></span>
              <span>{review.date}</span>
              <span>{review.readMins} min</span>
              <span>{review.genre}</span>
            </div>
          </header>

          <aside className="lg:col-span-5 space-y-5">
            {review.artUrl ? (
              <img src={review.artUrl} alt={`${review.title} cover`} className="w-full aspect-square object-cover" loading="lazy" />
            ) : (
              <div className={`art ${review.art}`} />
            )}
            {review.spotifyAlbumId && (
              <iframe
                title="Spotify album player"
                src={`https://open.spotify.com/embed/album/${review.spotifyAlbumId}?utm_source=cdreviews`}
                width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy"
              />
            )}
            {review.spotifyArtistId && (
              <iframe
                title="Spotify artist player"
                src={`https://open.spotify.com/embed/artist/${review.spotifyArtistId}?utm_source=cdreviews`}
                width="100%" height="352" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy"
              />
            )}
            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-4">
                <div className="fr-score text-[112px] text-vermil leading-none">
                  {review.score.toFixed(1)}<span className="text-ink text-[34px] align-top">/10</span>
                </div>
              </div>
              <div className="col-span-8 space-y-2">
                <div className="fr-card-title text-[22px]">{review.label}</div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mute">{review.format}</div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mute">{review.decade}</div>
                {review.spotifyUrl && (
                  <a href={review.spotifyUrl} target="_blank" rel="noopener noreferrer" className="block font-mono text-[10px] tracking-[0.18em] uppercase text-vermil hover:text-ink">↗ Open on Spotify</a>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 pt-10 border-t border-rule">
          <div className="lg:col-span-7 lg:col-start-1 space-y-6 fr-excerpt text-[19px] text-ink-2 max-w-[65ch]">
            {review.body.map((p, i) => (
              <p key={i} className={i === 0 ? "dropcap" : ""}>{p}</p>
            ))}
          </div>
          <div className="lg:col-span-4 lg:col-start-9 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Filed under</div>
            <div className="font-mono text-[11px] text-ink-2 space-y-1">
              <div>{review.genre}</div>
              <div>{review.label}</div>
              <div>{review.decade}</div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-rule">
          <div className="max-w-[1400px] mx-auto px-6 py-16">
            <h2 className="fr-display text-[36px] md:text-[48px] text-ink mb-10">More from {review.genre}.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {related.map((r) => <ReviewCard key={r.id} r={r} />)}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
