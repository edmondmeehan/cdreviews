import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";

export const Route = createFileRoute("/radio")({
  component: Radio,
  head: () => pageMeta("CDR Radio \u2014 cdreviews.", "A 24-hour listening room curated from three decades of reviews."),
});

function Radio() {
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 07" title="CDR Radio." dek="A 24-hour listening room. Programmed by the editors, sequenced by the room." />
      <section className="max-w-[1000px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7 space-y-6 fr-excerpt text-[19px] text-ink-2">
          <p className="dropcap">Radio is the oldest delivery system we know for music criticism — a host, a sequence, an opinion. CDR Radio brings that idea back, curated weekly from three decades of reviews.</p>
          <p>Currently rotating: <span className="text-ink">The 9.0+ Mix</span>, <span className="text-ink">From the Archive</span>, and <span className="text-ink">Editor's Picks</span>.</p>
          <button className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-bone px-5 py-3 hover:bg-ink">▶ Tune in</button>
        </div>
        <div className="md:col-span-5"><div className="art art-hero" /></div>
      </section>
      <SiteFooter />
    </div>
  );
}
