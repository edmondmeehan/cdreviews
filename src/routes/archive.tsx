import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { IndexRow, PageHead } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";
import { DECADE_LABELS } from "@/lib/cd-data";

const schema = z.object({
  decade: fallback(z.enum(["all", "1990s", "2000s", "2010s", "2020s"]), "all").default("all"),
  q: fallback(z.string().max(80), "").default(""),
  sort: fallback(z.enum(["newest", "oldest", "score"]), "newest").default("newest"),
});

export const Route = createFileRoute("/archive")({
  validateSearch: zodValidator(schema),
  component: Archive,
  head: () => pageMeta("Archive \u2014 cdreviews.", "Browse three decades of reviews. Filter by decade, search by artist, label, or title."),
});

function Archive() {
  const { decade, q, sort } = Route.useSearch();
  const all = useCdStore((s) => s.reviews.filter((r) => r.status === "published"));
  const filtered = all
    .filter((r) => decade === "all" || r.decade === decade)
    .filter((r) => !q || (r.title + r.artist + r.label).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) =>
      sort === "score" ? b.score - a.score : sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead
        num="§ 06"
        title="The archive."
        dek="Three decades, one obsession. Browse, search, sort."
        right={<><div>{filtered.length} of {all.length}</div></>}
      />
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">
        <div className="flex flex-wrap gap-x-10 gap-y-6 pb-8 border-b border-rule">
          <div className="flex-[1_1_360px] space-y-3">
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil">Search</div>
            <SearchBox initial={q} />
          </div>
          <div className="space-y-3">
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil">Decade</div>
            <Chips options={DECADE_LABELS} current={decade} paramKey="decade" />
          </div>
          <div className="space-y-3">
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil">Sort</div>
            <Chips
              options={[
                { key: "newest", label: "Newest" },
                { key: "oldest", label: "Oldest" },
                { key: "score", label: "Score" },
              ] as const}
              current={sort}
              paramKey="sort"
            />
          </div>
        </div>

        <div className="border-t-2 border-ink">
          {filtered.length === 0 ? (
            <p className="fr-pull text-[30px] text-ink-2 py-16 text-center">Empty stacks. Try a wider search.</p>
          ) : (
            filtered.map((r, i) => <IndexRow key={r.id} row={r} n={i + 1} showDecade />)
          )}
        </div>
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
        url.searchParams.set("q", v);
        window.history.replaceState(null, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
      className="flex rounded-full border border-ink/25 overflow-hidden focus-within:border-ink"
    >
      <input
        name="q"
        defaultValue={initial}
        maxLength={80}
        placeholder="Search artist, title, label…"
        aria-label="Search the archive"
        className="flex-1 min-w-0 h-11 bg-transparent border-0 px-5 font-mono text-[13px] text-ink outline-none placeholder:text-mute"
      />
      <button className="bg-vermil text-night font-mono text-[12px] tracking-[0.08em] uppercase px-5">Find →</button>
    </form>
  );
}

function Chips<T extends string>({ options, current, paramKey }: {
  options: ReadonlyArray<{ key: T; label: string }>;
  current: T;
  paramKey: "decade" | "sort";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.key === current;
        return (
          <Link
            key={opt.key}
            from="/archive"
            search={(prev: Record<string, unknown>) => ({ ...prev, [paramKey]: opt.key })}
            replace
            className={`inline-flex items-center h-11 px-[18px] rounded-full font-mono text-[12px] tracking-[0.08em] uppercase border transition-colors ${
              active ? "bg-paper text-night border-paper" : "text-ink border-ink/25 hover:border-ink"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
