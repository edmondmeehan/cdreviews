import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CrateGrid, IndexRow, Kicker, ReviewCard } from "@/components/site/bits";
import { useState } from "react";
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
  head: () => pageMeta("cdreviews. \u2014 A music review publication of record", "Independent music criticism since 1995. Album reviews, features, and the cdreviews archive."),
});

type ArchiveDecade = "all" | "1990s" | "2000s" | "2010s" | "2020s";

// Era names from the cdreviews editorial timeline. Each spine links to the
// archive filtered to the decade it belongs to.
const ERAS: Array<{ short: string; years: string; name: string; decade: ArchiveDecade; bg: string; ink: string; h: number }> = [
  { short: "95", years: "1995 — 1999", name: "The Founding", decade: "1990s", bg: "#ede8dc", ink: "#0f0e0c", h: 420 },
  { short: "00", years: "2000 — 2004", name: "Burned CDs", decade: "2000s", bg: "#3355ff", ink: "#f2f0e8", h: 440 },
  { short: "05", years: "2005 — 2009", name: "Blogs & MP3s", decade: "2000s", bg: "#a7c957", ink: "#13200a", h: 400 },
  { short: "10", years: "2010 — 2014", name: "The Stream Era", decade: "2010s", bg: "#2b2350", ink: "#c9b8ff", h: 450 },
  { short: "15", years: "2015 — 2019", name: "Playlist Logic", decade: "2010s", bg: "#c8a15a", ink: "#1a1208", h: 410 },
  { short: "20", years: "2020 — 2024", name: "The Pandemic Albums", decade: "2020s", bg: "#1f3b2d", ink: "#e8f0c8", h: 460 },
  { short: "25", years: "2025 — 2026", name: "Return of the Sleeve", decade: "2020s", bg: "#7a1e12", ink: "#f4d9c6", h: 430 },
  { short: "27", years: "2027 →", name: "The Next Chapter", decade: "all", bg: "#ff4a1c", ink: "#0f0e0c", h: 470 },
];

const SLOGANS = [
  "Independent music criticism", "Est. 1995", "Vol. 31",
  "A music review publication of record", "Reviews · Features · Lists · Archive · Radio",
];

function usePublished() {
  return useCdStore((s) => s.reviews.filter((r) => r.status === "published"));
}

function Hero() {
  const featured = useCdStore((s) => s.reviews.find((r) => r.slug === "kosmo-gardens-reentry") ?? s.reviews[0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  if (!featured) return <section className="min-h-[60vh]" aria-busy="true" />;
  const score = featured.score.toFixed(1);
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-24 md:pt-16 md:pb-32 flex flex-wrap gap-16 items-center">
      <div className="flex-[1_1_520px] min-w-0 relative z-[2]">
        <Kicker>Best New Music · Featured review</Kicker>
        <Link to="/reviews/$slug" params={{ slug: featured.slug }} className="block group">
          <h2 className="serif-it not-italic mt-6 text-[clamp(52px,7.4vw,120px)] leading-[0.9] text-ink" style={{ fontStyle: "normal" }}>
            The patient hum of a <em className="text-vermil">second life.</em>
          </h2>
        </Link>
        <p className="fr-dek mt-7 text-[19px] md:text-[21px] text-ink-2 max-w-[560px]">
          Three decades after their first transmission, {featured.artist} return with{" "}
          <em className="serif-it text-[1.1em] text-ink">{featured.title}</em> — a record that refuses the familiar comforts of the comeback, opting instead for something stranger, slower, and more luminous.
        </p>
        <div className="mt-9 flex flex-wrap gap-4 items-center">
          <Link
            to="/reviews/$slug"
            params={{ slug: featured.slug }}
            className="btn-pop inline-flex items-center h-[54px] px-7 bg-vermil text-night font-bold text-[16px] hover:text-night"
          >
            Read the review →
          </Link>
          <Link
            to="/radio"
            className="inline-flex items-center h-[54px] px-6 border border-ink/25 font-mono text-[12px] tracking-[0.12em] uppercase text-ink hover:border-vermil"
          >
            ▶ CDR Radio
          </Link>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
          <span>By <span className="text-ink">{featured.byline}</span></span>
          <span>{featured.date}</span>
          <span>{featured.readMins} min read</span>
        </div>
      </div>

      <div className="flex-[1_1_440px] min-w-0 flex justify-center relative">
        <div
          aria-hidden="true"
          className="fr-display-bold absolute -top-16 right-0 text-[clamp(200px,26vw,400px)] text-transparent opacity-55 pointer-events-none select-none z-0"
          style={{ WebkitTextStroke: "2px #ff4a1c" }}
        >
          {score}
        </div>
        <Link
          to="/reviews/$slug"
          params={{ slug: featured.slug }}
          aria-label={`${featured.title} by ${featured.artist}, ${score} out of 10`}
          className="group relative z-[1] w-full max-w-[460px] block"
          style={{ perspective: "1200px" }}
          onMouseMove={(e) => {
            const b = e.currentTarget.getBoundingClientRect();
            setTilt({
              x: Math.round(-((e.clientY - b.top) / b.height - 0.5) * 16),
              y: Math.round(((e.clientX - b.left) / b.width - 0.5) * 18),
            });
          }}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        >
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
          >
            <Cover r={featured} className="hero-cover" />
            <span className="absolute z-[3] -bottom-5 right-2 sm:-right-5 w-[104px] h-[104px] rounded-full bg-vermil text-night flex items-center justify-center fr-display-bold text-[42px] -rotate-12 shadow-[0_10px_24px_rgba(0,0,0,.4)]">
              {score}
            </span>
            <span className="absolute z-[3] left-2 sm:-left-6 top-9 bg-acid text-night font-mono text-[11px] tracking-[0.12em] uppercase px-3.5 py-2 -rotate-[8deg] shadow-[0_6px_14px_rgba(0,0,0,.35)]">
              Album of the week
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

function CrossingTickers() {
  const reviews = useCdStore((s) => s.reviews.filter((r) => r.status === "published").slice(0, 10));
  const items = [...reviews, ...reviews];
  const slogans = [...SLOGANS, ...SLOGANS, ...SLOGANS, ...SLOGANS];
  return (
    <div className="relative h-[170px] overflow-hidden" aria-label="Latest scores">
      <div className="absolute -left-[5%] -right-[5%] top-[34px] -rotate-[2.5deg] bg-vermil text-night border-y-2 border-night z-[2]">
        <div className="flex w-max animate-marquee py-3.5">
          {items.map((it, i) => (
            <Link
              key={`${it.id}-${i}`}
              to="/reviews/$slug"
              params={{ slug: it.slug }}
              className="inline-flex items-baseline gap-2.5 px-7 whitespace-nowrap text-[20px] font-bold tracking-[-0.01em] text-night hover:text-night hover:underline"
            >
              <span>{it.artist}</span>
              <span className="serif-it text-[22px]">{it.title}</span>
              <span className="font-mono text-[13px] bg-night text-vermil px-2 py-0.5">{it.score.toFixed(1)}</span>
              <span aria-hidden="true" className="ml-4">✺</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="absolute -left-[5%] -right-[5%] top-[72px] rotate-[2deg] bg-paper text-night z-[1]" aria-hidden="true">
        <div className="flex w-max animate-marquee marquee-rev py-3 font-mono text-[13px] tracking-[0.12em] uppercase">
          {slogans.map((s, i) => (
            <span key={i} className="px-6 whitespace-nowrap">{s} <span className="ml-6">●</span></span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ title, italic, right }: { title: string; italic: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 border-b border-rule pb-5">
      <h2 className="fr-display text-[clamp(44px,5.4vw,84px)] text-ink">
        {title} <span className="serif-it">{italic}</span>
      </h2>
      {right && <div className="font-mono text-[12px] tracking-[0.12em] uppercase text-mute">{right}</div>}
    </div>
  );
}

function BestNew() {
  const published = usePublished();
  const top = [...published].sort((a, b) => b.score - a.score).slice(0, 8);
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-16">
      <SectionHead
        title="Best new,"
        italic="this week."
        right={<>Sorted by score · <Link to="/best-new" className="text-vermil hover:underline">View all {published.length} →</Link></>}
      />
      <CrateGrid>
        {top.map((r) => <ReviewCard key={r.id} r={r} />)}
      </CrateGrid>
    </section>
  );
}

function RadioModule() {
  const published = usePublished();
  const mix = [...published].filter((r) => r.score >= 9).sort((a, b) => b.score - a.score).slice(0, 5);
  const isNinePlus = mix.length >= 3;
  const list = isNinePlus ? mix : [...published].sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mt-12">
      <div className="bg-bone-warm border border-rule flex flex-wrap overflow-hidden">
        <div className="flex-[1_1_460px] min-w-0 p-10 md:p-14 flex items-center justify-center relative bg-[#0b0a09]">
          <div className="cd-disc spin w-full max-w-[420px] aspect-square shadow-[0_30px_80px_rgba(0,0,0,.6)]" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 w-[46%] -ml-[23%] h-[2px] overflow-hidden" aria-hidden="true">
            <div className="laser h-[2px] w-full bg-[linear-gradient(90deg,transparent,#ff4a1c,transparent)]" />
          </div>
        </div>
        <div className="flex-[1_1_460px] min-w-0 p-10 md:p-14 flex flex-col gap-7">
          <div className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.12em] uppercase text-vermil">
            <span className="live-dot" /> CDR Radio · 24 hours
          </div>
          <h2 className="fr-display text-[clamp(44px,5vw,76px)] text-ink">
            {isNinePlus ? <>The 9.0+ <span className="serif-it">Mix.</span></> : <>Top of the <span className="serif-it">stacks.</span></>}
          </h2>
          <p className="fr-dek text-[17px] text-ink-2 max-w-[460px]">
            A listening room programmed by the editors, sequenced from three decades of reviews.
          </p>
          <ol className="border-t border-rule">
            {list.map((m, i) => (
              <li key={m.id} className="border-b border-rule">
                <Link
                  to="/reviews/$slug"
                  params={{ slug: m.slug }}
                  className={`flex items-center gap-4 py-3.5 ${i === 0 ? "text-vermil" : "text-ink"} hover:text-vermil`}
                >
                  <span className="font-mono text-[11px] w-7">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 min-w-0 truncate text-[18px] font-semibold">
                    {m.artist} <span className="serif-it font-normal text-[20px]">— {m.title}</span>
                  </span>
                  <span className="font-mono text-[11px]">{m.score.toFixed(1)}</span>
                </Link>
              </li>
            ))}
          </ol>
          <Link to="/radio" className="btn-pop self-start inline-flex items-center h-[54px] px-7 bg-vermil text-night font-bold text-[16px] hover:text-night">
            ▶ Tune in
          </Link>
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="bg-paper text-night mt-28 relative overflow-hidden">
      <div aria-hidden="true" className="serif-it absolute -left-2 -top-20 text-[440px] leading-none text-[#ddd5c2] select-none">“</div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-28 relative">
        <figure className="max-w-[1100px]">
          <blockquote className="serif-it not-italic text-[clamp(40px,5.8vw,92px)] leading-[0.98]" style={{ fontStyle: "normal" }}>
            Thirty years on, we still believe a record is a place —{" "}
            <em className="text-[#c2330f]">and a review is the postcard home.</em>
          </blockquote>
          <figcaption className="mt-8 font-mono text-[12px] tracking-[0.12em] uppercase text-[#5c574d]">— Editorial, Spring 2026</figcaption>
        </figure>
      </div>
    </section>
  );
}

function FromTheArchive() {
  const archived = useCdStore((s) => s.reviews.find((r) => r.slug === "vespertine-six-sleeve-sleeve"));
  const minis = useCdStore((s) => s.reviews.filter((r) => r.decade === "1990s" || r.decade === "2000s").slice(0, 3));
  if (!archived) return null;
  return (
    <section className="archive-paper bg-bone-warm border-y border-rule mt-28">
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
                  <Cover r={m} mini />
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

function EraRack() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-12">
      <div className="flex flex-wrap justify-between items-end gap-6">
        <h2 className="fr-display text-[clamp(44px,5.4vw,84px)] text-ink">
          Three decades,<br /><span className="serif-it">one obsession.</span>
        </h2>
        <p className="fr-dek max-w-[420px] text-[17px] text-ink-2">
          Every review since the first issue in October 1995, shelved by era. Pull one off the rack.{" "}
          <Link to="/archive" className="text-vermil hover:underline">Browse the archive →</Link>
        </p>
      </div>
      <div className="mt-16 overflow-x-auto pt-9">
        <div className="flex gap-1.5 items-end min-w-[760px] border-b-[6px] border-bone-2">
          {ERAS.map((e) => (
            <Link
              key={e.short}
              to="/archive"
              search={{ decade: e.decade, q: "", sort: "newest" }}
              className="spine flex-[1_1_96px] min-w-0 flex flex-col justify-between items-center py-[18px] shadow-[inset_-6px_0_0_rgba(0,0,0,.18)]"
              style={{ height: e.h, background: e.bg, color: e.ink }}
            >
              <span className="font-mono text-[10px] tracking-[0.12em]">{e.short}</span>
              <span className="fr-display-soft text-[28px] whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{e.name}</span>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase [writing-mode:vertical-rl] rotate-180">{e.years}</span>
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
            resetScroll={false}
            aria-current={active ? "true" : undefined}
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

function LatestList() {
  const { decade, kind } = Route.useSearch();
  const all = usePublished();
  const filtered = all.filter(
    (r) => (decade === "all" || r.decade === decade) && (kind === "all" || r.kind === kind),
  );
  const isFiltered = decade !== "all" || kind !== "all";

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-16">
      <div className="flex flex-wrap justify-between items-end gap-6 pb-8">
        <h2 className="fr-display text-[clamp(44px,5.4vw,84px)] text-ink">
          Latest reviews, <span className="serif-it">all of them.</span>
        </h2>
        <div className="font-mono text-[12px] tracking-[0.12em] uppercase text-mute">
          Showing <span className="text-ink">{filtered.length}</span> of {all.length}
          {isFiltered && (
            <>
              {" · "}
              <Link from="/" search={{ decade: "all", kind: "all" }} replace resetScroll={false} className="text-vermil hover:underline">Reset →</Link>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-5 pb-8">
        <div className="space-y-3">
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil">Decade</div>
          <FilterChips options={DECADE_LABELS} current={decade} paramKey="decade" />
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil">Type</div>
          <FilterChips options={KIND_LABELS} current={kind} paramKey="kind" />
        </div>
      </div>

      <div className="border-t-2 border-ink">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="fr-pull text-[30px] text-ink-2">Nothing in the stacks for that combination.</p>
            <Link from="/" search={{ decade: "all", kind: "all" }} replace resetScroll={false}
              className="inline-block mt-6 font-mono text-[12px] tracking-[0.12em] uppercase text-vermil hover:underline">
              → Clear filters
            </Link>
          </div>
        ) : (
          filtered.map((row, i) => <IndexRow key={row.id} row={row} n={i + 1} />)
        )}
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <CrossingTickers />
        <BestNew />
        <RadioModule />
        <Manifesto />
        <FromTheArchive />
        <EraRack />
        <LatestList />
      </main>
      <SiteFooter />
    </div>
  );
}
