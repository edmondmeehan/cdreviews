import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";
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
  head: () => ({
    meta: [
      { title: "Archive — cdreviews." },
      { name: "description", content: "Browse three decades of reviews. Filter by decade, search by artist, label, or title." },
    ],
  }),
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
      <section className="max-w-[1400px] mx-auto px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-rule">
          <div className="md:col-span-5 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Search</div>
            <SearchBox initial={q} />
          </div>
          <div className="md:col-span-4 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Decade</div>
            <Chips options={DECADE_LABELS} current={decade} paramKey="decade" />
          </div>
          <div className="md:col-span-3 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Sort</div>
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

        <div className="border-t border-rule">
          {filtered.length === 0 ? (
            <p className="fr-pull text-[28px] text-ink-2 py-16 text-center">Empty stacks. Try a wider search.</p>
          ) : (
            filtered.map((r, i) => (
              <Link key={r.id} to="/reviews/$slug" params={{ slug: r.slug }} className="grid grid-cols-12 gap-4 items-center border-b border-rule py-5 hover:bg-bone-2">
                <div className="col-span-1 font-mono text-[11px] tracking-[0.2em] text-mute">{String(i + 1).padStart(3, "0")}</div>
                <div className="col-span-11 md:col-span-4">
                  <h4 className="fr-row-title text-[22px] text-ink">{r.title}</h4>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mt-1">{r.artist} · {r.label}</div>
                </div>
                <div className="col-span-6 md:col-span-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink-2">{r.genre}</div>
                <div className="col-span-3 md:col-span-2 font-mono text-[10px] tracking-[0.2em] uppercase text-mute">{r.decade}</div>
                <div className="col-span-3 md:col-span-2 font-mono text-[10px] tracking-[0.2em] uppercase text-mute">{r.date}</div>
                <div className={`col-span-12 md:col-span-1 fr-score-card text-[28px] text-right ${r.score >= 8.5 ? "text-vermil" : "text-ink"}`}>{r.score.toFixed(1)}</div>
              </Link>
            ))
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
      className="flex border border-rule"
    >
      <input
        name="q"
        defaultValue={initial}
        maxLength={80}
        placeholder="Search artist, title, label…"
        className="flex-1 min-w-0 bg-transparent border-0 px-3 py-2.5 font-mono text-[12px] outline-none placeholder:text-mute"
      />
      <button className="bg-ink text-bone font-mono text-[10px] tracking-[0.2em] uppercase px-4">Find →</button>
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
            className={`font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border ${
              active ? "bg-ink text-bone border-ink" : "bg-bone text-ink-2 border-rule hover:border-ink"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
