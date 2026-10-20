import { AdSlot } from "@/components/site/AdSlot";
import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CrateGrid, PageHead, ReviewCard } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";
import { DECADE_LABELS, KIND_LABELS } from "@/lib/cd-data";
import { byNewest } from "@/lib/review-order";
import type { ReactNode } from "react";

const schema = z.object({
  decade: fallback(z.enum(["all", "1990s", "2000s", "2010s", "2020s"]), "all").default("all"),
  kind: fallback(z.enum(["all", "bnm", "bnr", "review"]), "all").default("all"),
  sort: fallback(z.enum(["newest", "score"]), "newest").default("newest"),
  page: fallback(z.number().int(), 1).default(1),
});

const PER_PAGE = 25;

export const Route = createFileRoute("/reviews/")({
  staticData: { sitemap: true },
  validateSearch: zodValidator(schema),
  search: { middlewares: [stripSearchParams<z.infer<typeof schema>>({ decade: "all", kind: "all", sort: "newest", page: 1 })] },
  component: ReviewsIndex,
  head: () => pageMeta("Reviews \u2014 cdreviews.", "Every published review, filterable by decade, type, and score."),
});

function ReviewsIndex() {
  const { decade, kind, sort, page } = Route.useSearch();
  const reviews = useCdStore((s) =>
    s.reviews
      .filter((r) => r.status === "published")
      .filter((r) => decade === "all" || r.decade === decade)
      .filter((r) => kind === "all" || r.kind === kind),
  );
  const sorted = [...reviews].sort((a, b) =>
    sort === "score" ? b.score - a.score : byNewest(a, b),
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageRows = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead
        num="§ 01"
        title="Reviews."
        dek="Every record we've graded since 1995. Filter by decade, type, or sort by score."
        right={<><div>{sorted.length} results · page {safePage} of {pageCount}</div></>}
      />
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">
        <div className="flex flex-wrap gap-x-10 gap-y-6 pb-8 border-b border-rule">
          <FilterRow label="Decade" options={DECADE_LABELS} current={decade} paramKey="decade" />
          <FilterRow label="Type" options={KIND_LABELS} current={kind} paramKey="kind" />
          <FilterRow label="Sort" options={[{ key: "newest", label: "Newest" }, { key: "score", label: "Highest score" }] as const} current={sort} paramKey="sort" />
        </div>
        {sorted.length === 0 ? (
          <p className="fr-pull text-[30px] text-ink-2 py-16 text-center">Nothing in the stacks.</p>
        ) : (
          <CrateGrid>
            {pageRows.map((r) => <ReviewCard key={r.id} r={r} />)}
          </CrateGrid>
        )}
        {pageCount > 1 && (
          <nav aria-label="Reviews pages" className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <PageLink page={safePage - 1} disabled={safePage <= 1}>← Prev</PageLink>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <PageLink key={p} page={p} active={p === safePage}>{p}</PageLink>
            ))}
            <PageLink page={safePage + 1} disabled={safePage >= pageCount}>Next →</PageLink>
          </nav>
        )}
      </section>
      <AdSlot placement="home_break" className="pb-16" />
      <SiteFooter />
    </div>
  );
}

function FilterRow<T extends string>({ label, options, current, paramKey }: {
  label: string; options: ReadonlyArray<{ key: T; label: string }>; current: T; paramKey: "decade" | "kind" | "sort";
}) {
  return (
    <div className="space-y-3">
      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.key === current;
          return (
            <Link
              key={opt.key}
              from="/reviews/"
              search={(prev) => ({ ...prev, [paramKey]: opt.key, page: 1 })}
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
    </div>
  );
}

function PageLink({ page, active = false, disabled = false, children }: {
  page: number; active?: boolean; disabled?: boolean; children: ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled="true" className="inline-flex items-center h-11 px-[18px] rounded-full font-mono text-[12px] tracking-[0.08em] uppercase border border-ink/10 text-ink/30">
        {children}
      </span>
    );
  }
  return (
    <Link
      from="/reviews/"
      search={(prev) => ({ ...prev, page })}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center h-11 px-[18px] rounded-full font-mono text-[12px] tracking-[0.08em] uppercase border transition-colors ${
        active ? "bg-paper text-night border-paper" : "text-ink border-ink/25 hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}
