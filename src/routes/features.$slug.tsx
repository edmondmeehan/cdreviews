import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Kicker } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";
import { LEGACY_FEATURE_SLUGS } from "@/lib/legacy-redirects";

export const Route = createFileRoute("/features/$slug")({
  component: FeaturePage,
  notFoundComponent: NotFound,
  head: ({ params }) => pageMeta(`${params.slug.replace(/-/g, " ")} — Feature — cdreviews.`, "Long-form music criticism and interviews from cdreviews.", "article"),
});

function NotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="bg-bone min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-[820px] mx-auto px-6 py-24 space-y-6">
        <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">§ 404 · Spike not filed</div>
        <h1 className="fr-display text-[64px] md:text-[88px] text-ink">Feature not found.</h1>
        <p className="fr-dek text-[19px] text-ink-2 max-w-[55ch]">No feature lives at <span className="font-mono text-ink">/features/{slug}</span>.</p>
        <Link to="/features" className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-night px-5 py-3 hover:bg-ink inline-block">→ All features</Link>
      </div>
      <SiteFooter />
    </div>
  );
}

function FeaturePage() {
  const { slug } = Route.useParams();
  const f = useCdStore((s) => s.features.find((x) => x.slug === slug));
  if (!f) {
    const redirectSlug = LEGACY_FEATURE_SLUGS[slug];
    if (redirectSlug) return <Navigate to="/features/$slug" params={{ slug: redirectSlug }} replace />;
    return <NotFound />;
  }
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <article className="max-w-[820px] mx-auto px-6 py-20">
        <Kicker>Feature</Kicker>
        <h1 className="fr-display text-[56px] md:text-[88px] text-ink mt-6">{f.title}</h1>
        <p className="fr-dek text-[20px] md:text-[24px] text-ink-2 mt-6">{f.dek}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.2em] uppercase text-mute border-y border-rule py-3 mt-8">
          <span>By <span className="text-ink">{f.byline}</span></span>
          <span>{f.date}</span>
          <span>{f.readMins} min</span>
        </div>
        <div className={`art ${f.art} my-10`} />
        <div className="space-y-6 fr-excerpt text-[19px] text-ink-2">
          {f.body.map((p, i) => <p key={i} className={i === 0 ? "dropcap" : ""}>{p}</p>)}
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
