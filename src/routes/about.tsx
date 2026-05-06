import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [{ title: "About — cdreviews." }, { name: "description", content: "What cdreviews is, what it isn't, and what the score system means." }],
  }),
});

function About() {
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 08" title="About." dek="Founded October 1995. Independent ever since." />
      <section className="max-w-[820px] mx-auto px-6 py-16 space-y-6 fr-excerpt text-[19px] text-ink-2">
        <p className="dropcap">cdreviews. is a music review publication of record. We grade every record we publish on a fixed scale, unchanged since November 1995. We do not chase numbers, trends, or platforms.</p>
        <p>We have reading rooms in Brooklyn, Berlin and Tokyo. We are independent, reader-supported, and frequently wrong.</p>
        <h2 className="fr-display text-[36px] text-ink mt-12">The score system</h2>
        <p><span className="text-vermil font-mono">9.0+</span> Essential. Once-a-quarter records.</p>
        <p><span className="text-vermil font-mono">8.0–8.9</span> Excellent. Worth your weekend.</p>
        <p><span className="text-vermil font-mono">7.0–7.9</span> Good, with caveats.</p>
        <p><span className="text-vermil font-mono">Below 7</span> Read the review.</p>
      </section>
      <SiteFooter />
    </div>
  );
}
