import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Kicker, ReviewCard } from "@/components/site/bits";
import { Cover } from "@/components/site/Cover";
import { CoverLightbox } from "@/components/site/CoverLightbox";
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
  const [zoom, setZoom] = useState(false);

  if (!review) {
    const redirectSlug = LEGACY_REVIEW_SLUGS[slug];
    if (redirectSlug) return <Navigate to="/reviews/$slug" params={{ slug: redirectSlug }} replace />;
    return <NotFound />;
  }
  const badge = review.kind === "bnm" ? "BEST NEW MUSIC" : review.kind === "bnr" ? "BEST NEW REISSUE" : null;

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />

      <article className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <aside className="lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label={`Open ${review.title} cover`}
              className="block w-full cursor-zoom-in hover:opacity-95 transition-opacity"
            >
              <Cover r={review} />
            </button>
            <div className="flex items-baseline gap-3 border-t border-rule pt-3">
              <div className="fr-score text-[72px] text-vermil leading-none">{review.score.toFixed(1)}</div>
              <div className="text-ink text-[20px]">/10</div>
            </div>
            <dl className="font-mono text-[10px] tracking-[0.18em] uppercase text-mute grid grid-cols-[80px_1fr] gap-y-1.5">
              <dt>Label</dt><dd className="text-ink">{review.label}</dd>
              <dt>Format</dt><dd>{review.format}</dd>
              <dt>Genre</dt><dd>{review.genre}</dd>
              <dt>Decade</dt><dd>{review.decade}</dd>
            </dl>
            {review.spotifyUrl && (
              <a href={review.spotifyUrl} target="_blank" rel="noopener noreferrer" className="block font-mono text-[10px] tracking-[0.18em] uppercase text-vermil hover:text-ink">↗ Open on Spotify</a>
            )}
          </aside>

          <header className="lg:col-span-8 space-y-5">
            {badge && <Kicker color="vermil">{badge}</Kicker>}
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">{review.artist}</div>
            <h1 className="fr-display text-[52px] md:text-[80px] leading-[0.95] text-ink">{review.title}</h1>
            {review.pull && (
              <p className="fr-pull text-[22px] md:text-[28px] text-ink-2 max-w-[32ch] border-l-2 border-vermil pl-5">
                "{review.pull}"
              </p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] tracking-[0.2em] uppercase text-mute border-y border-rule py-2.5">
              <span>By <span className="text-ink">{review.byline}</span></span>
              <span>{review.date}</span>
              <span className="text-vermil">{review.genre}</span>
              <span>{review.readMins} min</span>
            </div>
            {(review.spotifyAlbumId || review.spotifyArtistId) && (
              <div className="space-y-3 pt-1">
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
                    width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    loading="lazy"
                  />
                )}
              </div>
            )}
          </header>
        </div>

        <div className="mt-12 pt-8 border-t border-rule grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 lg:col-start-3 space-y-5 fr-excerpt text-[19px] text-ink-2 max-w-[68ch]">
            {review.body.map((p, i) => (
              <p key={i} className={i === 0 ? "dropcap" : ""}>{p}</p>
            ))}
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
      {zoom && <CoverLightbox r={review} onClose={() => setZoom(false)} />}
    </div>
  );
}
