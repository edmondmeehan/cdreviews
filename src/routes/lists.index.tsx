import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";

export const Route = createFileRoute("/lists/")({
  component: ListsIndex,
  head: () => pageMeta("Lists \u2014 cdreviews.", "Ranked lists, working documents, year-end arguments."),
});

function ListsIndex() {
  const lists = useCdStore((s) => s.lists.filter((l) => l.status === "published"));
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 05" title="Lists." dek="Ranked lists. Working documents. Year-end arguments." />
      <section className="max-w-[1400px] mx-auto px-6 py-16 space-y-10">
        {lists.map((l) => (
          <Link key={l.id} to="/lists/$slug" params={{ slug: l.slug }} className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-rule pt-8 hover:bg-bone-2 -mx-3 px-3 pb-4">
            <div className="md:col-span-3"><div className={`art ${l.art}`} /></div>
            <div className="md:col-span-9 space-y-3">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">{l.byline} · {l.date} · {l.items.length} entries</div>
              <h2 className="fr-display text-[40px] md:text-[56px] text-ink">{l.title}</h2>
              <p className="fr-dek text-[18px] text-ink-2 max-w-[60ch]">{l.dek}</p>
            </div>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
