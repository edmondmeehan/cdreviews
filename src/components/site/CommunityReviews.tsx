import { useEffect, useState } from "react";
import { getCommunityReviews, type CommunityBlock } from "@/lib/community-reviews.functions";

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span aria-label={`${value} out of 5`} className="text-vermil tracking-[0.15em]">
      {"★".repeat(full)}<span className="text-rule">{"★".repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

/** Reader reviews from CritiqueBrainz (MetaBrainz). Loads after the page so it never slows the review down. */
export function CommunityReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<CommunityBlock | null>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    getCommunityReviews({ data: { slug } }).then((d) => { if (live) setData(d); }).catch(() => {});
    return () => { live = false; };
  }, [slug]);

  if (!data || (!data.reviews.length && !data.averageRating)) return null;

  return (
    <section className="border-t border-rule" aria-labelledby="community-heading">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
          <h2 id="community-heading" className="fr-display text-[clamp(40px,4.4vw,64px)] text-ink">
            From <span className="serif-it">the community.</span>
          </h2>
          {data.averageRating && (
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-mute flex items-center gap-3">
              <Stars value={data.averageRating} />
              <span className="text-ink">{data.averageRating.toFixed(1)}/5</span>
              {data.ratingCount > 0 && <span>{data.ratingCount} rating{data.ratingCount === 1 ? "" : "s"}</span>}
            </div>
          )}
        </div>

        {data.reviews.length > 0 && (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {data.reviews.map((r) => (
              <article key={r.id} className="border-t-2 border-ink pt-5 min-w-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.1em] uppercase text-mute">
                  {r.authorUrl ? (
                    <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-vermil">{r.author}</a>
                  ) : <span className="text-ink">{r.author}</span>}
                  {formatDate(r.publishedOn) && <span>{formatDate(r.publishedOn)}</span>}
                  {r.rating && <Stars value={r.rating} />}
                </div>
                <div className="mt-4 space-y-4 fr-excerpt text-[17px] text-ink-2 max-w-[62ch]">
                  {r.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] tracking-[0.1em] uppercase text-mute">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-vermil hover:text-ink">
                    {r.truncated ? "↗ Read the full review" : "↗ On CritiqueBrainz"}
                  </a>
                  <a href={r.license.url} target="_blank" rel="license noopener noreferrer" className="hover:text-ink">{r.license.id}</a>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-12 font-mono text-[10px] tracking-[0.1em] uppercase text-mute">
          Reader reviews and ratings from{" "}
          <a href={data.critiquebrainzUrl ?? "https://critiquebrainz.org"} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-vermil">CritiqueBrainz</a>
          , a <a href="https://metabrainz.org" target="_blank" rel="noopener noreferrer" className="text-ink hover:text-vermil">MetaBrainz</a> project.
          Not written by cdreviews.{" "}
          {data.critiquebrainzUrl && (
            <a href={data.critiquebrainzUrl} target="_blank" rel="noopener noreferrer" className="text-vermil hover:text-ink">Write your own ↗</a>
          )}
        </p>
      </div>
    </section>
  );
}
