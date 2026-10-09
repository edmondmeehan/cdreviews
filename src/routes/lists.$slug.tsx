import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Kicker } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";
import { LEGACY_LIST_SLUGS } from "@/lib/legacy-redirects";

export const Route = createFileRoute("/lists/$slug")({
  component: ListPage,
  notFoundComponent: NotFound,
  head: ({ params }) => pageMeta(`${params.slug.replace(/-/g, " ")} — List — cdreviews.`, "Records selected and ranked by cdreviews.", "article"),
});

function NotFound() {
  const { slug } = Route.useParams();
  return (
    <div className="bg-bone min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-[820px] mx-auto px-6 py-24 space-y-6">
        <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">§ 404 · Off the ledger</div>
        <h1 className="fr-display text-[64px] md:text-[88px] text-ink">List not found.</h1>
        <p className="fr-dek text-[19px] text-ink-2 max-w-[55ch]">No list lives at <span className="font-mono text-ink">/lists/{slug}</span>.</p>
        <Link to="/lists" className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-bone px-5 py-3 hover:bg-ink inline-block">→ All lists</Link>
      </div>
      <SiteFooter />
    </div>
  );
}

function ListPage() {
  const { slug } = Route.useParams();
  const l = useCdStore((s) => s.lists.find((x) => x.slug === slug));
  if (!l) {
    const redirectSlug = LEGACY_LIST_SLUGS[slug];
    if (redirectSlug) return <Navigate to="/lists/$slug" params={{ slug: redirectSlug }} replace />;
    return <NotFound />;
  }
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <header className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <Kicker>List</Kicker>
          <h1 className="fr-display text-[56px] md:text-[88px] text-ink">{l.title}</h1>
          <p className="fr-dek text-[20px] text-ink-2 max-w-[55ch]">{l.dek}</p>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute border-t border-rule pt-3">
            By <span className="text-ink">{l.byline}</span> · {l.date}
          </div>
        </div>
        <div className="lg:col-span-5"><div className={`art ${l.art}`} /></div>
      </header>
      <section className="max-w-[1000px] mx-auto px-6 pb-24">
        <ol className="border-t border-rule">
          {l.items.map((it) => (
            <li key={it.rank} className="grid grid-cols-12 gap-4 items-center border-b border-rule py-6">
              <div className="col-span-2 fr-score-card text-[48px] text-vermil">{String(it.rank).padStart(2, "0")}</div>
              <div className="col-span-10 space-y-1">
                <h3 className="fr-row-title text-[26px] text-ink">{it.title}</h3>
                <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">{it.artist}</div>
                {it.note && <p className="fr-blurb text-[15px] text-ink-2 mt-1">{it.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <SiteFooter />
    </div>
  );
}
