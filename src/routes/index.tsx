import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Kicker, ReviewCard } from "@/components/site/bits";
import { Cover } from "@/components/site/Cover";
import { useCdStore } from "@/lib/cd-store";
import { DECADE_LABELS, KIND_LABELS } from "@/lib/cd-data";

const DECADE_KEYS = ["all", "1990s", "2000s", "2010s", "2020s"] as const;
const KIND_KEYS = ["all", "bnm", "bnr", "review"] as const;

const searchSchema = z.object({
  decade: fallback(z.enum(DECADE_KEYS), "all").default("all"),
  kind: fallback(z.enum(KIND_KEYS), "all").default("all"),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  component: Index,
  head: () => ({
    meta: [
      { title: "cdreviews. — A music review publication of record" },
      { name: "description", content: "Independent music criticism since 1995. Reviews, features, and an archive of 38,412 records." },
    ],
  }),
});

const DECADE_TIMELINE = [
  { years: "1995 — 1999", count: "2,103", label: "The Founding" },
  { years: "2000 — 2004", count: "3,847", label: "Burned CDs" },
  { years: "2005 — 2009", count: "5,221", label: "Blogs & MP3s" },
  { years: "2010 — 2014", count: "5,894", label: "The Stream Era" },
  { years: "2015 — 2019", count: "6,402", label: "Playlist Logic" },
  { years: "2020 — 2024", count: "7,118", label: "The Pandemic Albums" },
  { years: "2025 — 2026", count: "3,084", label: "Return of the Sleeve" },
  { years: "2027 →", count: "∞", label: "The Next Chapter", current: true },
];

function Hero() {
  const featured = useCdStore((s) => s.reviews.find((r) => r.slug === "kosmo-gardens-reentry") ?? s.reviews[0]);
  if (!featured) return null;
  return (
    <section className="border-b border-rule">
      <div className="max-w-[1400px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <Kicker>Best New Music · Featured Review</Kicker>
            <Link to="/reviews/$slug" params={{ slug: featured.slug }}>
              <h2 className="fr-display text-[56px] md:text-[88px] lg:text-[104px] text-ink hover:text-vermil transition-colors">
                The patient hum of a second life.
              </h2>
            </Link>
            <p className="fr-dek text-[20px] md:text-[22px] text-ink-2 max-w-[60ch]">
              Three decades after their first transmission, {featured.artist} return with <em className="fr-display-italic">{featured.title}</em>: a record that refuses the familiar comforts of the comeback, opting instead for something stranger, slower, and more luminous.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] tracking-[0.18em] uppercase text-mute pt-4 border-t border-rule">
            <span className="text-ink">{featured.byline}</span>
            <span>{featured.date}</span>
            <span>{featured.readMins} min read</span>
            <Link to="/reviews/$slug" params={{ slug: featured.slug }} className="ml-auto text-vermil hover:underline">
              → Read review
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-mute">
            <span>↳ Album of the Week</span>
            <span>№ 011</span>
          </div>
          <Link to="/reviews/$slug" params={{ slug: featured.slug }}>
            <Cover r={featured} />
          </Link>
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-4">
              <div className="fr-score text-[88px] md:text-[112px] text-vermil">{featured.score.toFixed(1)}<span className="text-ink text-[34px] align-top">/10</span></div>
            </div>
            <div className="col-span-8 space-y-2">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink">{featured.artist.toUpperCase()}</div>
              <div className="fr-card-title text-[24px]">{featured.title} — {featured.label}</div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mute">Released 04.18.2026 · {featured.format}</div>
            </div>
          </div>
          {featured.pull && (
            <blockquote className="fr-pull text-[22px] text-ink-2 border-l-2 border-vermil pl-5">
              “{featured.pull}”
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ num, title, right }: { num: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-6 grid grid-cols-12 gap-6 items-end border-t border-rule">
      <div className="col-span-12 md:col-span-1 font-mono text-[11px] tracking-[0.25em] text-vermil">{num}</div>
      <h3 className="col-span-12 md:col-span-7 fr-display text-[44px] md:text-[60px] text-ink">{title}</h3>
      <div className="col-span-12 md:col-span-4 font-mono text-[10px] tracking-[0.2em] uppercase text-mute md:text-right">{right}</div>
    </div>
  );
}

function ReviewsGrid() {
  const reviews = useCdStore((s) => s.reviews.filter((r) => r.status === "published").slice(0, 8));
  return (
    <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 pb-10">
      {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
    </div>
  );
}

function Manifesto() {
  return (
    <section className="border-y border-rule bg-bone-warm">
      <div className="max-w-[1400px] mx-auto px-6 py-24 manifesto-quote">
        <p className="fr-pull text-[36px] md:text-[56px] text-ink max-w-[24ch] mx-auto text-center relative z-10">
          Thirty years on, we still believe a record is a place — and a review is the postcard home.
        </p>
        <div className="mt-10 text-center font-mono text-[10px] tracking-[0.3em] uppercase text-mute">— Editorial, Spring 2026</div>
      </div>
    </section>
  );
}

function FromTheArchive() {
  const archived = useCdStore((s) => s.reviews.find((r) => r.slug === "vespertine-six-sleeve-sleeve"));
  const minis = useCdStore((s) => s.reviews.filter((r) => r.decade === "1990s" || r.decade === "2000s").slice(0, 3));
  if (!archived) return null;
  return (
    <section className="archive-paper bg-bone-warm border-b border-rule">
      <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-12 gap-6 items-end pb-10 border-b border-rule">
          <div className="col-span-12 md:col-span-1 font-mono text-[11px] tracking-[0.25em] text-vermil">§ 03</div>
          <h3 className="col-span-12 md:col-span-7 fr-archive-h text-[44px] md:text-[60px] text-ink">
            From the archive — thirty years ago this week.
          </h3>
          <div className="col-span-12 md:col-span-4 font-mono text-[10px] tracking-[0.2em] uppercase text-mute md:text-right space-y-1">
            <div>ISSUE № 011</div>
            <div>Filed 05.06.1996</div>
            <div>Volume I · No. 11</div>
            <div>Originally in print</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12">
          <div className="lg:col-span-5 space-y-5">
            <Link to="/reviews/$slug" params={{ slug: archived.slug }}><Cover r={archived} /></Link>
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-mute">
              <span>From the stacks</span>
              <span>SPRING / 1996</span>
            </div>
            <div className="space-y-2">
              <div className="fr-card-title text-[26px] text-ink">{archived.artist.toUpperCase()} — {archived.title}</div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">{archived.label} · {archived.format}</div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Kicker>On this day · 30 years ago</Kicker>
            <h4 className="fr-display-italic text-[40px] md:text-[56px] text-ink leading-tight">
              “{archived.pull}”
            </h4>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.2em] uppercase text-mute border-y border-rule py-3">
              <span>Reviewed by <span className="text-ink">{archived.byline}</span></span>
              <span>Filed {archived.date}</span>
              <span>Genre {archived.genre}</span>
            </div>
            <div className="space-y-5 fr-excerpt text-[18px] text-ink-2 max-w-[65ch]">
              <p className="dropcap">{archived.body[0]}</p>
              {archived.body[1] && <p>{archived.body[1]}</p>}
            </div>
            <div className="flex flex-wrap items-end gap-8 pt-6 border-t border-rule">
              <div className="fr-score text-[88px] text-vermil leading-none">{archived.score.toFixed(1)}<span className="text-ink text-[28px] align-top">/10</span></div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute leading-relaxed">
                <div>Originally rated</div>
                <div>Score system unchanged</div>
                <div>since November 1995</div>
              </div>
              <Link to="/reviews/$slug" params={{ slug: archived.slug }} className="ml-auto font-mono text-[11px] tracking-[0.25em] uppercase text-vermil hover:underline">
                → Read in full · {archived.readMins} min
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-rule">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase text-mute mb-8">
            <span className="inline-block w-6 h-px bg-vermil" />
            Also from the stacks
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {minis.map((m) => (
              <Link key={m.id} to="/reviews/$slug" params={{ slug: m.slug }} className="flex items-start gap-4 border-t border-rule pt-4 hover:bg-bone/40">
                <div className="w-[84px] h-[84px] flex-shrink-0">
                  <Cover r={m} />
                </div>
                <div className="flex-1">
                  <h5 className="fr-mini-title text-[20px] text-ink">{m.title}</h5>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mt-1">
                    {m.artist} · {m.label}
                  </div>
                </div>
                <div className="fr-score-card text-[28px] text-ink">{m.score.toFixed(1)}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchiveTimeline() {
  return (
    <section className="border-b border-rule">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          <h3 className="lg:col-span-7 fr-display text-[44px] md:text-[64px] text-ink">
            Three decades, one obsession.
          </h3>
          <p className="lg:col-span-5 fr-dek text-[18px] text-ink-2 self-end">
            An archive of <span className="text-vermil">38,412 reviews</span>, going back to the first issue, October 1995. <Link to="/archive" className="text-vermil hover:underline">Browse the archive →</Link>
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule border border-rule">
          {DECADE_TIMELINE.map((d, i) => (
            <Link
              key={i}
              to="/archive"
              className={`p-6 flex flex-col gap-3 min-h-[180px] ${d.current ? "bg-vermil text-bone" : "bg-bone hover:bg-bone-2"}`}
            >
              <div className={`font-mono text-[10px] tracking-[0.2em] uppercase ${d.current ? "text-bone/80" : "text-mute"}`}>{d.years}</div>
              <div className={`fr-score-card text-[44px] ${d.current ? "text-bone" : "text-ink"}`}>{d.count}</div>
              <div className={`fr-mini-title text-[16px] mt-auto ${d.current ? "text-bone" : "text-ink-2"}`}>{d.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterChips<T extends string>({
  options, current, paramKey,
}: {
  options: ReadonlyArray<{ key: T; label: string }>;
  current: T;
  paramKey: "decade" | "kind";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.key === current;
        return (
          <Link
            key={opt.key}
            from="/"
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
  );
}

function LatestList() {
  const { decade, kind } = Route.useSearch();
  const all = useCdStore((s) => s.reviews.filter((r) => r.status === "published"));
  const filtered = all.filter(
    (r) => (decade === "all" || r.decade === decade) && (kind === "all" || r.kind === kind),
  );
  const isFiltered = decade !== "all" || kind !== "all";

  return (
    <section className="border-b border-rule">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-10">
          <h3 className="lg:col-span-7 fr-display text-[44px] md:text-[60px] text-ink">
            Latest reviews, all of them.
          </h3>
          <div className="lg:col-span-5 font-mono text-[10px] tracking-[0.2em] uppercase text-mute lg:text-right">
            Showing <span className="text-ink">{filtered.length}</span> of {all.length}
            {isFiltered && (
              <>
                {" · "}
                <Link from="/" search={{ decade: "all", kind: "all" }} replace className="text-vermil hover:underline">Reset →</Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pb-8 border-b border-rule">
          <div className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Decade</div>
            <FilterChips options={DECADE_LABELS} current={decade} paramKey="decade" />
          </div>
          <div className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Type</div>
            <FilterChips options={KIND_LABELS} current={kind} paramKey="kind" />
          </div>
        </div>

        <div className="border-t border-rule">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="fr-pull text-[28px] text-ink-2">Nothing in the stacks for that combination.</p>
              <Link from="/" search={{ decade: "all", kind: "all" }} replace
                className="inline-block mt-6 font-mono text-[11px] tracking-[0.25em] uppercase text-vermil hover:underline">
                → Clear filters
              </Link>
            </div>
          ) : (
            filtered.map((row, i) => (
              <Link
                key={row.id}
                to="/reviews/$slug"
                params={{ slug: row.slug }}
                className="grid grid-cols-12 gap-4 items-center border-b border-rule py-5 hover:bg-bone-2 transition-colors"
              >
                <div className="col-span-1 font-mono text-[11px] tracking-[0.2em] text-mute">{String(i + 1).padStart(3, "0")}</div>
                <div className="col-span-12 md:col-span-4">
                  <h4 className="fr-row-title text-[26px] text-ink">{row.title}</h4>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mt-1">{row.artist} · {row.label}</div>
                </div>
                <div className="col-span-6 md:col-span-1 font-mono text-[9px] tracking-[0.2em] uppercase">
                  {row.kind === "bnm" && <span className="text-acid bg-ink px-1.5 py-1">BNM</span>}
                  {row.kind === "bnr" && <span className="text-acid bg-ink px-1.5 py-1">BNR</span>}
                  {row.kind === "review" && <span className="text-mute">REV</span>}
                </div>
                <div className="col-span-6 md:col-span-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink-2">{row.genre}</div>
                <div className="col-span-3 md:col-span-2 font-mono text-[10px] tracking-[0.2em] uppercase text-mute">{row.date}</div>
                <div className={`col-span-3 md:col-span-2 fr-score-card text-[36px] text-right ${row.score >= 8.5 ? "text-vermil" : row.score < 7 ? "text-mute" : "text-ink"}`}>
                  {row.score.toFixed(1)}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Index() {
  const reviewCount = useCdStore((s) => s.reviews.length);
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <Hero />
      <SectionHeader
        num="§ 02"
        title="Best new this week."
        right={<>Sorted by score · <Link to="/best-new" className="text-vermil hover:underline">View all {reviewCount} →</Link></>}
      />
      <ReviewsGrid />
      <Manifesto />
      <FromTheArchive />
      <ArchiveTimeline />
      <LatestList />
      <SiteFooter />
    </div>
  );
}
