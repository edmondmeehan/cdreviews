import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead, ReviewCard } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";

export const Route = createFileRoute("/best-new")({
  component: BestNew,
  head: () => ({
    meta: [
      { title: "Best New — cdreviews." },
      { name: "description", content: "Best New Music and Best New Reissue, the records we believe in most this season." },
    ],
  }),
});

function BestNew() {
  const bnm = useCdStore((s) => s.reviews.filter((r) => r.kind === "bnm" && r.status === "published"));
  const bnr = useCdStore((s) => s.reviews.filter((r) => r.kind === "bnr" && r.status === "published"));

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead
        num="§ 02"
        title="Best new."
        dek="The records we believe in most. Updated as we go — never inflated, occasionally regretted."
      />
      <section className="max-w-[1400px] mx-auto px-6 py-16 space-y-16">
        <div>
          <h2 className="fr-display text-[40px] text-vermil mb-8">Best New Music</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {bnm.map((r) => <ReviewCard key={r.id} r={r} />)}
          </div>
        </div>
        <div>
          <h2 className="fr-display text-[40px] text-vermil mb-8">Best New Reissue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {bnr.map((r) => <ReviewCard key={r.id} r={r} />)}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
