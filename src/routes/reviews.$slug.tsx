import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CrateGrid, Kicker, ReviewCard } from "@/components/site/bits";
import { Cover } from "@/components/site/Cover";
import { CoverLightbox } from "@/components/site/CoverLightbox";
import { useCdStore } from "@/lib/cd-store";
import { LEGACY_REVIEW_SLUGS } from "@/lib/legacy-redirects";

export const Route = createFileRoute("/reviews/$slug")({
  component: ReviewPage,
  notFoundComponent: NotFound,
  head: ({ params }) => pageMeta(`${params.slug.replace(/-/g, " ")} — Review — cdreviews.`, "Album criticism, scores, and listening from the cdreviews archive.", "article"),
});

function NotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="bg-bone min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-[820px] mx-auto px-6 py-24 space-y-6">
        <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">§ 404 · Off the shelf</div>
        <h1 className="fr-display text-[64px] md:text-[88px] text-ink">Review <span className="serif-it">not found.</span></h1>
        <p className="fr-dek text-[19px] text-ink-2 max-w-[55ch]">
          We don't have a review at <span className="font-mono text-ink">/reviews/{slug}</span>. It may have been retitled, unpublished, or never existed.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/reviews" className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-night px-5 py-3 btn-pop">→ All reviews</Link>
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
  const ready = useCdStore((s) => s.ready);
  const related = useCdStore((s) => s.reviews.filter((r) => r.slug !== slug && r.genre === review?.genre).slice(0, 4));
  const [zoom, setZoom] = useState(false);

  if (!ready) return <div className="bg-bone text-ink min-h-screen"><SiteHeader /><main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-24 flex items-center gap-4 font-mono text-[12px] tracking-[0.12em] uppercase text-mute"><span className="cd-disc spin w-10 h-10" aria-hidden="true" />Loading review…</main><SiteFooter /></div>;

  if (!review) {
    const redirectSlug = LEGACY_REVIEW_SLUGS[slug];
    if (redirectSlug) return <Navigate to="/reviews/$slug" params={{ slug: redirectSlug }} replace />;
    return <NotFound />;
  }
  const badge = review.kind === "bnm" ? "Best New Music" : review.kind === "bnr" ? "Best New Reissue" : null;

  const genre = review.genre && review.genre !== "Uncategorized" ? review.genre : null;
  const hot = review.score >= 8.5;

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />

      <article>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-16 flex flex-wrap gap-14 items-start">
          <aside className="flex-[1_1_380px] max-w-[520px] min-w-0 lg:sticky lg:top-8">
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label={`Open ${review.title} cover`}
              className="group relative block w-full cursor-zoom-in"
            >
              <Cover r={review} pop />
              <span className={`absolute z-[3] -bottom-6 right-2 sm:-right-4 w-[112px] h-[112px] rounded-full flex items-center justify-center fr-display-bold text-[44px] -rotate-12 text-night shadow-[0_10px_24px_rgba(0,0,0,.4)] ${hot ? "bg-vermil" : "bg-paper"}`}>
                {review.score.toFixed(1)}
              </span>
            </button>
            <dl className="mt-12 font-mono text-[11px] tracking-[0.1em] uppercase text-mute grid grid-cols-[90px_1fr] gap-y-2.5 border-t border-rule pt-5">
              <dt>Label</dt><dd className="text-ink">{review.label}</dd>
              {review.format && (<><dt>Format</dt><dd className="text-ink-2">{review.format}</dd></>)}
              {genre && (<><dt>Genre</dt><dd className="text-ink-2">{genre}</dd></>)}
              <dt>Decade</dt><dd className="text-ink-2">{review.decade}</dd>
            </dl>
            {review.spotifyUrl && (
              <a href={review.spotifyUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block font-mono text-[11px] tracking-[0.1em] uppercase text-vermil hover:text-ink">↗ Open on Spotify</a>
            )}
          </aside>

          <div className="flex-[1_1_560px] min-w-0">
            <header className="space-y-6">
              {badge ? <Kicker>{badge}</Kicker> : <Kicker>Review</Kicker>}
              <div className="font-mono text-[13px] tracking-[0.12em] uppercase text-ink-2">{review.artist}</div>
              <h1 className="font-serif text-[clamp(56px,8vw,128px)] leading-[0.9] tracking-[-0.02em] text-ink">{review.title}</h1>
              {review.pull && (
                <p className="fr-pull text-[24px] md:text-[32px] text-vermil max-w-[30ch]">
                  “{review.pull}”
                </p>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] tracking-[0.1em] uppercase text-mute border-y border-rule py-3">
                <span>By <span className="text-ink">{review.byline}</span></span>
                <span>{review.date}</span>
                {genre && <span className="text-vermil">{genre}</span>}
                <span>{review.readMins} min read</span>
              </div>
              {(review.spotifyAlbumId || review.spotifyArtistId) && (
                <div className="space-y-3 pt-1">
                  {review.spotifyAlbumId && (
                    <iframe
                      title="Spotify album player"
                      src={`https://open.spotify.com/embed/album/${review.spotifyAlbumId}?utm_source=cdreviews&theme=0`}
                      width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    />
                  )}
                  {review.spotifyArtistId && (
                    <iframe
                      title="Spotify artist player"
                      src={`https://open.spotify.com/embed/artist/${review.spotifyArtistId}?utm_source=cdreviews&theme=0`}
                      width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    />
                  )}
                </div>
              )}
            </header>

            <div className="mt-12 space-y-6 fr-excerpt text-[19px] md:text-[20px] text-ink-2 max-w-[66ch]">
              {review.body.map((p, i) => (
                <p key={i} className={i === 0 ? "dropcap" : ""}>{p}</p>
              ))}
            </div>
            <div className="mt-12 pt-6 border-t border-rule flex flex-wrap items-end gap-6">
              <div className={`fr-score text-[96px] ${hot ? "text-vermil" : "text-ink"}`}>
                {review.score.toFixed(1)}<span className="text-ink text-[32px] align-top">/10</span>
              </div>
              <Link to="/reviews" className="ml-auto font-mono text-[12px] tracking-[0.12em] uppercase text-vermil hover:underline">
                ← All reviews
              </Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-rule">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-20">
            <h2 className="fr-display text-[clamp(40px,4.4vw,64px)] text-ink border-b border-rule pb-5">
              More from <span className="serif-it">the stacks.</span>
            </h2>
            <CrateGrid>
              {related.map((r) => <ReviewCard key={r.id} r={r} />)}
            </CrateGrid>
          </div>
        </section>
      )}

      <SiteFooter />
      {zoom && <CoverLightbox r={review} onClose={() => setZoom(false)} />}
    </div>
  );
}
