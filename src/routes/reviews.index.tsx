import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead, ReviewCard } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";
import { DECADE_LABELS, KIND_LABELS } from "@/lib/cd-data";

const schema = z.object({
  decade: fallback(z.enum(["all", "1990s", "2000s", "2010s", "2020s"]), "all").default("all"),
  kind: fallback(z.enum(["all", "bnm", "bnr", "review"]), "all").default("all"),
  sort: fallback(z.enum(["newest", "score"]), "newest").default("newest"),
});

export const Route = createFileRoute("/reviews/")({
  validateSearch: zodValidator(schema),
  component: ReviewsIndex,
  head: () => ({
    meta: [
      { title: "Reviews — cdreviews." },
      { name: "description", content: "Every published review, filterable by decade, type, and score." },
    ],
  }),
});

function ReviewsIndex() {
  const { decade, kind, sort } = Route.useSearch();
  const reviews = useCdStore((s) =>
    s.reviews
      .filter((r) => r.status === "published")
      .filter((r) => decade === "all" || r.decade === decade)
      .filter((r) => kind === "all" || r.kind === kind),
  );
  const sorted = [...reviews].sort((a, b) =>
    sort === "score" ? b.score - a.score : b.date.localeCompare(a.date),
  );

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead
        num="§ 01"
        title="Reviews."
        dek="Every record we've graded since 1995. Filter by decade, type, or sort by score."
        right={<><div>{sorted.length} results</div></>}
      />
      <section className="max-w-[1400px] mx-auto px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-rule">
          <FilterRow label="Decade" options={DECADE_LABELS} current={decade} paramKey="decade" />
          <FilterRow label="Type" options={KIND_LABELS} current={kind} paramKey="kind" />
          <FilterRow label="Sort" options={[{ key: "newest", label: "Newest" }, { key: "score", label: "Highest score" }] as const} current={sort} paramKey="sort" />
        </div>
        {sorted.length === 0 ? (
          <p className="fr-pull text-[28px] text-ink-2 py-16 text-center">Nothing in the stacks.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {sorted.map((r) => <ReviewCard key={r.id} r={r} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

function FilterRow<T extends string>({ label, options, current, paramKey }: {
  label: string; options: ReadonlyArray<{ key: T; label: string }>; current: T; paramKey: "decade" | "kind" | "sort";
}) {
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.key === current;
          return (
            <Link
              key={opt.key}
              from="/reviews"
              search={(prev: Record<string, unknown>) => ({ ...prev, [paramKey]: opt.key })}
              replace
              className={`font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border transition-colors ${
                active ? "bg-ink text-bone border-ink" : "bg-bone text-ink-2 border-rule hover:border-ink"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
