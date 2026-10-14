import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { IndexRow, PageHead } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";
import type { Review } from "@/lib/cd-data";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(schema),
  component: SearchPage,
  head: () =>
    pageMeta(
      "Search — cdreviews.",
      "Search the cdreviews archive by artist, album, or label.",
    ),
});

/** Rank matches: exact-ish field hits first, then partial matches. */
function searchReviews(reviews: Review[], q: string): Review[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const fields = (r: Review) => [r.artist, r.title, r.label];
  const scored = reviews
    .map((r) => {
      const f = fields(r).map((v) => (v ?? "").toLowerCase());
      let score = 0;
      if (f.some((v) => v === needle)) score = 3;
      else if (f.some((v) => v.startsWith(needle))) score = 2;
      else if (f.some((v) => v.includes(needle))) score = 1;
      return { r, score };
    })
    .filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || b.r.score - a.r.score);
  return scored.map((x) => x.r);
}

function SearchPage() {
  const { q } = Route.useSearch();
  const published = useCdStore((s) => s.reviews.filter((r) => r.status === "published"));
  const results = searchReviews(published, q);

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead
        num="§ 07"
        title="Search the stacks."
        dek="Every published review, by artist, album, or label."
        right={q ? <div>{results.length} result{results.length === 1 ? "" : "s"}</div> : undefined}
      />
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-10">
        <SearchBox initial={q} />

        {!q.trim() ? (
          <p className="fr-pull text-[26px] sm:text-[30px] text-ink-2 py-10 text-center">
            Type an artist, album, or label to dig through the archive.
          </p>
        ) : results.length === 0 ? (
          <div className="py-10 text-center space-y-4">
            <p className="fr-pull text-[26px] sm:text-[30px] text-ink-2">
              Nothing in the stacks for “{q.trim()}”.
            </p>
            <p className="font-mono text-[12px] tracking-[0.12em] uppercase text-mute">
              Try a shorter spelling, or{" "}
              <Link to="/archive" className="text-vermil hover:underline">
                browse the full archive
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="border-t-2 border-ink">
            {results.map((r, i) => (
              <IndexRow key={r.id} row={r} n={i + 1} showDecade />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

function SearchBox({ initial }: { initial: string }) {
  return (
    <form
      method="GET"
      onSubmit={(e) => {
        e.preventDefault();
        const v = (new FormData(e.currentTarget).get("q") ?? "").toString();
        const url = new URL(window.location.href);
        if (v) url.searchParams.set("q", v);
        else url.searchParams.delete("q");
        window.history.replaceState(null, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
      className="flex rounded-full border border-ink/25 overflow-hidden focus-within:border-ink max-w-[720px] mx-auto"
    >
      <input
        name="q"
        defaultValue={initial}
        maxLength={80}
        autoFocus
        placeholder="Artist, album, or label…"
        aria-label="Search reviews"
        className="flex-1 min-w-0 h-14 bg-transparent border-0 px-6 font-mono text-[15px] text-ink outline-none placeholder:text-mute"
      />
      <button className="bg-vermil text-night font-mono text-[13px] tracking-[0.08em] uppercase px-7">
        Find →
      </button>
    </form>
  );
}
