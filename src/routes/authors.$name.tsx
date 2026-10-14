import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { IndexRow, PageHead } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";

export function authorSlug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/authors/$name")({
  component: AuthorPage,
  head: ({ params }) => {
    const name = params.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return pageMeta(
      `${name} — cdreviews.`,
      `Every published review by ${name} on cdreviews.`,
    );
  },
});

function AuthorPage() {
  const { name } = Route.useParams();
  const bylines = useCdStore((s) =>
    [...new Set(s.reviews.filter((r) => r.status === "published").map((r) => r.byline))],
  );
  const byline = bylines.find((b) => authorSlug(b) === name);
  const reviews = useCdStore((s) =>
    s.reviews.filter((r) => r.status === "published" && r.byline === byline),
  );
  const sorted = [...reviews].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      {byline ? (
        <>
          <PageHead
            num="Byline"
            title={`${byline}.`}
            dek={`${sorted.length} published ${sorted.length === 1 ? "review" : "reviews"} from the cdreviews archive.`}
            right={<div>{sorted.length} reviews</div>}
          />
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
            {sorted.map((r, i) => (
              <IndexRow key={r.id} row={r} n={i + 1} showDecade />
            ))}
          </section>
        </>
      ) : (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-24 space-y-6">
          <h1 className="fr-display text-[48px] text-ink">No such writer.</h1>
          <p className="fr-dek text-[18px] text-ink-2 max-w-[52ch]">
            We couldn't find a writer by that name in the archive.
          </p>
          <Link to="/archive" className="inline-block font-mono text-[12px] tracking-[0.12em] uppercase text-vermil hover:underline">
            ← Browse the archive
          </Link>
        </section>
      )}
      <SiteFooter />
    </div>
  );
}
