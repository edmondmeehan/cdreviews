import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CrateGrid, PageHead, ReviewCard } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";

export const Route = createFileRoute("/best-new")({
  component: BestNew,
  head: () => pageMeta("Best New \u2014 cdreviews.", "Best New Music and Best New Reissue, the records we believe in most this season."),
});

function BestNew() {
  const published = useCdStore((s) => s.reviews.filter((r) => r.status === "published"));
  const bnm = published.filter((r) => r.kind === "bnm");
  const bnr = published.filter((r) => r.kind === "bnr");
  // Until editors flag Best New picks, show the highest-rated records instead of an empty page.
  const topRated = [...published].filter((r) => r.score >= 8.5).sort((a, b) => b.score - a.score);

  const sections = [
    { title: "Best New", italic: "Music.", items: bnm },
    { title: "Best New", italic: "Reissue.", items: bnr },
  ].filter((sec) => sec.items.length > 0);
  if (sections.length === 0 && topRated.length > 0) {
    sections.push({ title: "Highest", italic: "rated.", items: topRated });
  }

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead
        num="§ 02"
        title="Best new."
        dek="The records we believe in most. Updated as we go — never inflated, occasionally regretted."
      />
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 space-y-24">
        {sections.map((sec) => (
          <div key={sec.italic}>
            <h2 className="fr-display text-[clamp(40px,4.4vw,64px)] text-ink border-b border-rule pb-5">
              {sec.title} <span className="serif-it text-vermil">{sec.italic}</span>
            </h2>
            <CrateGrid>
              {sec.items.map((r) => <ReviewCard key={r.id} r={r} />)}
            </CrateGrid>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="fr-pull text-[30px] text-ink-2 py-16 text-center">The shelf is being restocked.</p>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
