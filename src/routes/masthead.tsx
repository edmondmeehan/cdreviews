import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";

export const Route = createFileRoute("/masthead")({
  component: Masthead,
  head: () => pageMeta("Masthead \u2014 cdreviews.", "The editors and contributors of cdreviews."),
});

function Masthead() {
  const contributors = useCdStore((s) => s.contributors);
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 09" title="Masthead." dek="The room behind the publication." />
      <section className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {contributors.map((c) => (
          <article key={c.id} className="border-t border-rule pt-5 space-y-2">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">{c.role}</div>
            <h2 className="fr-card-title text-[28px] text-ink">{c.name}</h2>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">{c.city}</div>
            <p className="fr-blurb text-[16px] text-ink-2 max-w-[50ch]">{c.bio}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
