import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

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

// ────────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  { tag: "NEW", artist: "Lia Thrum", title: "Glass Engine", score: "8.7" },
  { tag: "NEW", artist: "Marcia Velour", title: "Plain Songs", score: "7.9" },
  { tag: "BNM", artist: "Kosmo Gardens", title: "Reentry", score: "9.1" },
  { tag: "NEW", artist: "Field Pulse", title: "Antenna", score: "6.8" },
  { tag: "NEW", artist: "The Hours After", title: "Kin", score: "8.2" },
  { tag: "BNR", artist: "Tamarind State", title: "Ovum", score: "8.9" },
  { tag: "NEW", artist: "Halflit", title: "Wading", score: "7.4" },
  { tag: "NEW", artist: "Moss & Wire", title: "Atlas Tape", score: "8.0" },
];

const NAV_LINKS = [
  { label: "Today", current: true },
  { label: "Reviews" },
  { label: "Best New" },
  { label: "Features" },
  { label: "Lists" },
  { label: "Archive" },
  { label: "Radio" },
];

type Review = {
  art: string; genre: string; date: string; title: string; artist: string;
  score: string; label: string; format: string; badge?: string; hi?: boolean;
};

const REVIEWS: Review[] = [
  { art: "art-1", genre: "Electronic", date: "05.04.26", title: "Glass Engine", artist: "Lia Thrum", score: "8.7", label: "Selo Mint", format: "LP · 9 tr", badge: "BEST NEW MUSIC", hi: true },
  { art: "art-2", genre: "Folk", date: "05.03.26", title: "Plain Songs", artist: "Marcia Velour", score: "7.9", label: "Hardly Quiet", format: "EP · 6 tr" },
  { art: "art-3", genre: "Ambient", date: "05.02.26", title: "Wading", artist: "Halflit", score: "7.4", label: "Constellation", format: "LP · 7 tr" },
  { art: "art-4", genre: "Post-Punk", date: "05.01.26", title: "Ovum", artist: "Tamarind State", score: "8.9", label: "Numero", format: "2xLP · 14 tr", badge: "BEST NEW REISSUE", hi: true },
  { art: "art-5", genre: "Pop", date: "04.30.26", title: "Antenna", artist: "Field Pulse", score: "6.8", label: "Dirty Hit", format: "LP · 11 tr" },
  { art: "art-6", genre: "Jazz", date: "04.29.26", title: "Kin", artist: "The Hours After", score: "8.2", label: "Verve", format: "LP · 8 tr" },
  { art: "art-7", genre: "Hip-Hop", date: "04.28.26", title: "Atlas Tape", artist: "Moss & Wire", score: "8.0", label: "Self-Released", format: "LP · 13 tr" },
  { art: "art-8", genre: "Experimental", date: "04.27.26", title: "Reentry", artist: "Kosmo Gardens", score: "9.1", label: "Bow Hill", format: "LP · 11 tr", hi: true },
];

const ARCHIVE_MINIS = [
  { art: "art-mini-1", title: "Northing", artist: "Bantam Year", label: "Trabant", score: "7.6" },
  { art: "art-mini-2", title: "Heel-and-Toe", artist: "Cordwainer", label: "Heavenly", score: "6.9" },
  { art: "art-mini-3", title: "Veridia", artist: "Marisol Tien", label: "Mo'Wax", score: "8.1" },
];

const DECADES = [
  { years: "1995 — 1999", count: "2,103", label: "The Founding" },
  { years: "2000 — 2004", count: "3,847", label: "Burned CDs" },
  { years: "2005 — 2009", count: "5,221", label: "Blogs & MP3s" },
  { years: "2010 — 2014", count: "5,894", label: "The Stream Era" },
  { years: "2015 — 2019", count: "6,402", label: "Playlist Logic" },
  { years: "2020 — 2024", count: "7,118", label: "The Pandemic Albums" },
  { years: "2025 — 2026", count: "3,084", label: "Return of the Sleeve" },
  { years: "2027 →", count: "∞", label: "The Next Chapter", current: true },
];

type Decade = (typeof DECADE_KEYS)[number];
type Kind = (typeof KIND_KEYS)[number];

const LATEST: Array<{
  num: string; title: string; artist: string; label: string;
  genre: string; date: string; score: string; tone?: string;
  decade: Exclude<Decade, "all">; kind: Exclude<Kind, "all">;
}> = [
  { num: "001", title: "Glass Engine", artist: "Lia Thrum", label: "Selo Mint", genre: "Electronic / Ambient", date: "05.04.2026", score: "8.7", tone: "hi", decade: "2020s", kind: "bnm" },
  { num: "002", title: "Plain Songs", artist: "Marcia Velour", label: "Hardly Quiet", genre: "Folk", date: "05.03.2026", score: "7.9", decade: "2020s", kind: "review" },
  { num: "003", title: "Reentry", artist: "Kosmo Gardens", label: "Bow Hill", genre: "Experimental", date: "05.02.2026", score: "9.1", tone: "hi", decade: "2020s", kind: "bnm" },
  { num: "004", title: "Wading", artist: "Halflit", label: "Constellation", genre: "Ambient", date: "05.02.2026", score: "7.4", decade: "2020s", kind: "review" },
  { num: "005", title: "Antenna", artist: "Field Pulse", label: "Dirty Hit", genre: "Pop", date: "04.30.2026", score: "6.8", tone: "lo", decade: "2020s", kind: "review" },
  { num: "006", title: "Ovum (Reissue)", artist: "Tamarind State", label: "Numero", genre: "Post-Punk", date: "04.28.2026", score: "8.9", tone: "hi", decade: "2020s", kind: "bnr" },
  { num: "007", title: "Kin", artist: "The Hours After", label: "Verve", genre: "Jazz", date: "04.27.2026", score: "8.2", decade: "2020s", kind: "review" },
  { num: "008", title: "Atlas Tape", artist: "Moss & Wire", label: "Self-Released", genre: "Hip-Hop", date: "04.26.2026", score: "8.0", decade: "2020s", kind: "review" },
  { num: "009", title: "Slow Carriage", artist: "Vellum Pines", label: "Drag City", genre: "Indie Rock", date: "11.12.2018", score: "7.8", decade: "2010s", kind: "review" },
  { num: "010", title: "Halogen", artist: "Court & Spark", label: "4AD", genre: "Dream Pop", date: "06.04.2015", score: "8.5", tone: "hi", decade: "2010s", kind: "bnm" },
  { num: "011", title: "Mire (Reissue)", artist: "The Lemonheads", label: "Fire", genre: "Alternative", date: "09.21.2012", score: "8.3", decade: "2010s", kind: "bnr" },
  { num: "012", title: "Ferrous", artist: "Iron Pigeon", label: "Sub Pop", genre: "Garage Rock", date: "03.30.2007", score: "7.1", decade: "2000s", kind: "review" },
  { num: "013", title: "Late Bloom", artist: "Jenna Holst", label: "Matador", genre: "Singer-Songwriter", date: "08.14.2003", score: "8.0", decade: "2000s", kind: "review" },
  { num: "014", title: "Ardent (Reissue)", artist: "Big Star", label: "Rhino", genre: "Power Pop", date: "02.10.2001", score: "9.2", tone: "hi", decade: "2000s", kind: "bnr" },
  { num: "015", title: "Sleeve & Sleeve", artist: "Vespertine Six", label: "Tigerhand", genre: "Post-Rock / Slowcore", date: "05.06.1996", score: "8.4", decade: "1990s", kind: "bnm" },
  { num: "016", title: "Quiet County", artist: "Marisol Tien", label: "Mo'Wax", genre: "Trip-Hop", date: "10.02.1998", score: "8.1", decade: "1990s", kind: "review" },
];

const FOOTER_COLS = [
  { heading: "Read", links: ["Reviews", "Best New", "Features", "Interviews", "Lists"] },
  { heading: "Listen", links: ["CDR Radio", "The 9.0+ Mix", "Editor's Picks", "From the Archive"] },
  { heading: "About", links: ["Masthead", "Contact", "Submissions", "Ethics policy", "Advertising"] },
];

// ────────────────────────────────────────────────────────────────
// SHARED
// ────────────────────────────────────────────────────────────────

function Kicker({ children, color = "vermil" }: { children: React.ReactNode; color?: "vermil" | "acid" }) {
  const colorClass = color === "acid" ? "text-acid" : "text-vermil";
  const lineColor = color === "acid" ? "bg-acid" : "bg-vermil";
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase">
      <span className={`inline-block w-6 h-px ${lineColor}`} />
      <span className={colorClass}>{children}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SECTIONS
// ────────────────────────────────────────────────────────────────

function UtilityBar() {
  return (
    <div className="border-b border-rule bg-bone">
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-ink-2">
        <div className="flex items-center"><span className="live-dot" />LIVE · 14,892 readers</div>
        <div className="hidden md:block">WED · 06 MAY 2026 · 14:32 EST · CYCLE 31</div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-vermil">Account</a>
          <a href="#" className="hover:text-vermil">Subscribe</a>
          <a href="#" className="hover:text-vermil">Search ⌘K</a>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="bg-ink overflow-hidden border-b border-ink">
      <div className="flex animate-marquee whitespace-nowrap py-2.5">
        {items.map((it, i) => (
          <span key={i} className="font-mono text-[11px] text-bone px-6 flex-shrink-0">
            <span className={it.tag === "BNM" ? "text-acid mr-2" : it.tag === "BNR" ? "text-acid mr-2" : "text-vermil mr-2"}>
              {it.tag}
            </span>
            <span className="text-bone/90">{it.artist}</span>
            <span className="text-bone/60"> — {it.title}</span>
            <span className="text-bone/40"> · </span>
            <span className="text-acid">{it.score}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Masthead() {
  return (
    <header className="border-b border-rule bg-bone">
      <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-4 flex items-end justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <h1 className="fr-display-bold text-[110px] md:text-[160px] text-ink leading-none">cdreviews.</h1>
          <span className="hidden md:inline font-mono text-[10px] tracking-[0.3em] uppercase text-mute">EST. 1995</span>
        </div>
        <span className="hidden lg:inline font-mono text-[10px] tracking-[0.3em] uppercase text-mute">VOL · 31</span>
      </div>
      <nav className="max-w-[1400px] mx-auto px-6 pb-3 flex items-center gap-7 border-t border-rule pt-3 overflow-x-auto">
        {NAV_LINKS.map((l) => (
          <a
            key={l.label}
            href="#"
            className={`font-mono text-[11px] tracking-[0.2em] uppercase whitespace-nowrap ${l.current ? "text-vermil" : "text-ink-2 hover:text-vermil"}`}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-rule">
      <div className="max-w-[1400px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <Kicker>Best New Music · Featured Review</Kicker>
            <h2 className="fr-display text-[64px] md:text-[88px] lg:text-[104px] text-ink">
              The patient hum of a second life.
            </h2>
            <p className="fr-dek text-[20px] md:text-[22px] text-ink-2 max-w-[60ch]">
              Three decades after their first transmission, Kosmo Gardens return with <em className="fr-display-italic">Reentry</em>: a record that refuses the familiar comforts of the comeback, opting instead for something stranger, slower, and more luminous. It is the kind of album that rewires the room around it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] tracking-[0.18em] uppercase text-mute pt-4 border-t border-rule">
            <span className="text-ink">Maren Okafor</span>
            <span>05.06.2026</span>
            <span>12 min read</span>
            <a href="#" className="ml-auto text-vermil hover:underline">→ Read review</a>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-mute">
            <span>↳ Album of the Week</span>
            <span>№ 011</span>
          </div>
          <div className="art art-hero" />
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-4">
              <div className="fr-score text-[88px] md:text-[112px] text-vermil">9.1<span className="text-ink text-[34px] align-top">/10</span></div>
            </div>
            <div className="col-span-8 space-y-2">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink">KOSMO GARDENS</div>
              <div className="fr-card-title text-[24px]">Reentry — Bow Hill Records</div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mute">Released 04.18.2026 · 11 tracks · 47:22</div>
            </div>
          </div>
          <blockquote className="fr-pull text-[22px] text-ink-2 border-l-2 border-vermil pl-5">
            “It listens back. That is the whole trick of it — every note feels like the album is paying attention to you.”
          </blockquote>
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

function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="group border-t border-rule pt-5 flex flex-col gap-4">
      <div className={`art ${r.art}`} />
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-mute">
        <span className={r.hi ? "text-vermil" : ""}>{r.genre}</span>
        <span>{r.date}</span>
      </div>
      <div className="space-y-2">
        {r.badge && (
          <div className="inline-block bg-ink text-acid font-mono text-[9px] tracking-[0.25em] uppercase px-2 py-1">
            {r.badge}
          </div>
        )}
        <h4 className="fr-card-title text-[28px] text-ink">{r.title}</h4>
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-2">{r.artist}</p>
      </div>
      <div className="flex items-end justify-between border-t border-rule pt-3 mt-auto">
        <div className={`fr-score-card text-[52px] ${r.hi ? "text-vermil" : "text-ink"}`}>
          {r.score}<span className="text-[18px] text-mute align-top">/10</span>
        </div>
        <div className="text-right font-mono text-[10px] tracking-[0.18em] uppercase text-mute leading-relaxed">
          <div>{r.label}</div>
          <div>{r.format}</div>
        </div>
      </div>
    </article>
  );
}

function ReviewsGrid() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 pb-10">
      {REVIEWS.map((r, i) => <ReviewCard key={i} r={r} />)}
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
            <div className="art art-archive" />
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-mute">
              <span>From the stacks</span>
              <span>SPRING / 1996</span>
            </div>
            <div className="space-y-2">
              <div className="fr-card-title text-[26px] text-ink">VESPERTINE SIX — Sleeve & Sleeve</div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">Tigerhand Recordings · CD/LP · 38:14</div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">Released April 1996 · 9 tracks</div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Kicker>On this day · 30 years ago</Kicker>
            <h4 className="fr-display-italic text-[40px] md:text-[56px] text-ink leading-tight">
              “A debut that knew exactly what it was.”
            </h4>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.2em] uppercase text-mute border-y border-rule py-3">
              <span>Reviewed by <span className="text-ink">B. Solène Marquet</span></span>
              <span>Filed 05.06.1996</span>
              <span>Genre Post-rock / Slowcore</span>
            </div>
            <div className="space-y-5 fr-excerpt text-[18px] text-ink-2 max-w-[65ch]">
              <p className="dropcap">
                For most of its 38 minutes Sleeve & Sleeve refuses to raise its voice. The Brooklyn quartet's debut is built from quiet asymmetries — a guitar line that won't quite resolve, a snare that arrives a fraction late on purpose, a singer who treats every word as if it might break in her hands.
              </p>
              <p>
                The record knows it could be louder. It refuses the offer. By the closing track, an eight-minute exhalation called “Sleeve, Reprise,” you understand exactly why: this is a band more interested in the room after the song ends than in the song itself.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-8 pt-6 border-t border-rule">
              <div className="fr-score text-[88px] text-vermil leading-none">8.4<span className="text-ink text-[28px] align-top">/10</span></div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute leading-relaxed">
                <div>Originally rated</div>
                <div>Score system unchanged</div>
                <div>since November 1995</div>
              </div>
              <a href="#" className="ml-auto font-mono text-[11px] tracking-[0.25em] uppercase text-vermil hover:underline">
                → Read in full · 6 min
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-rule">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase text-mute mb-8">
            <span className="inline-block w-6 h-px bg-vermil" />
            Also this week in '96 — the original three-album round-up
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ARCHIVE_MINIS.map((m, i) => (
              <div key={i} className="flex items-start gap-4 border-t border-rule pt-4">
                <div className={`art-mini ${m.art} flex-shrink-0`} />
                <div className="flex-1">
                  <h5 className="fr-mini-title text-[20px] text-ink">{m.title}</h5>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mt-1">
                    {m.artist} · {m.label}
                  </div>
                </div>
                <div className="fr-score-card text-[28px] text-ink">{m.score}</div>
              </div>
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
            An archive of <span className="text-vermil">38,412 reviews</span>, going back to the first issue, October 1995. Browse by year, decade, label, or score.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule border border-rule">
          {DECADES.map((d, i) => (
            <div
              key={i}
              className={`p-6 flex flex-col gap-3 min-h-[180px] ${d.current ? "bg-vermil text-bone" : "bg-bone hover:bg-bone-2"}`}
            >
              <div className={`font-mono text-[10px] tracking-[0.2em] uppercase ${d.current ? "text-bone/80" : "text-mute"}`}>
                {d.years}
              </div>
              <div className={`fr-score-card text-[44px] ${d.current ? "text-bone" : "text-ink"}`}>
                {d.count}
              </div>
              <div className={`fr-mini-title text-[16px] mt-auto ${d.current ? "text-bone" : "text-ink-2"}`}>
                {d.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const DECADE_OPTIONS: Array<{ key: Decade; label: string }> = [
  { key: "all", label: "All decades" },
  { key: "1990s", label: "1990s" },
  { key: "2000s", label: "2000s" },
  { key: "2010s", label: "2010s" },
  { key: "2020s", label: "2020s" },
];

const KIND_OPTIONS: Array<{ key: Kind; label: string }> = [
  { key: "all", label: "All types" },
  { key: "bnm", label: "Best New Music" },
  { key: "bnr", label: "Best New Reissue" },
  { key: "review", label: "Standard review" },
];

function FilterChips<T extends string>({
  options, current, paramKey,
}: {
  options: Array<{ key: T; label: string }>;
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
            search={(prev) => ({ ...prev, [paramKey]: opt.key })}
            replace
            className={`font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border transition-colors ${
              active
                ? "bg-ink text-bone border-ink"
                : "bg-bone text-ink-2 border-rule hover:border-ink"
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
  const filtered = LATEST.filter(
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
            Showing <span className="text-ink">{filtered.length}</span> of {LATEST.length}
            {isFiltered && (
              <>
                {" · "}
                <Link from="/" search={{ decade: "all", kind: "all" }} replace className="text-vermil hover:underline">
                  Reset →
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pb-8 border-b border-rule">
          <div className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Decade</div>
            <FilterChips options={DECADE_OPTIONS} current={decade} paramKey="decade" />
          </div>
          <div className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Type</div>
            <FilterChips options={KIND_OPTIONS} current={kind} paramKey="kind" />
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
            filtered.map((row) => (
              <div key={row.num} className="grid grid-cols-12 gap-4 items-center border-b border-rule py-5 hover:bg-bone-2 transition-colors">
                <div className="col-span-1 font-mono text-[11px] tracking-[0.2em] text-mute">{row.num}</div>
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
                <div className={`col-span-3 md:col-span-2 fr-score-card text-[36px] text-right ${row.tone === "hi" ? "text-vermil" : row.tone === "lo" ? "text-mute" : "text-ink"}`}>
                  {row.score}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-bone">
      <div className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 space-y-5">
          <div className="fr-display-bold text-[56px] text-bone leading-none">cdreviews.</div>
          <p className="fr-dek text-[16px] text-bone/70 max-w-[36ch]">
            A music review publication of record. Independent since 1995. Reading rooms in Brooklyn, Berlin & Tokyo.
          </p>
        </div>

        {FOOTER_COLS.map((col, i) => (
          <div key={i} className="md:col-span-2 space-y-4">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-acid">{col.heading}</div>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="font-mono text-[11px] text-bone/80 hover:text-vermil tracking-wide">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2 space-y-4">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-acid">The Mailer</div>
          <p className="fr-blurb text-[14px] text-bone/70">
            A weekly letter from the editor. Reviews, dispatches, the occasional argument.
          </p>
          <form className="flex border border-bone/20" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="@email"
              className="flex-1 bg-transparent border-0 px-3 py-2.5 text-bone font-mono text-[11px] outline-none placeholder:text-bone/40"
            />
            <button className="bg-vermil text-bone font-mono text-[10px] tracking-[0.2em] uppercase px-4 hover:bg-bone hover:text-ink transition-colors">
              Send →
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-bone/10">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] uppercase text-bone/50">
          <span>© 1995 — 2026 cdreviews</span>
          <span>All rights reserved · Print ISSN 1095‑3814</span>
          <span>A publication of the third floor.</span>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────────

function Index() {
  return (
    <div className="bg-bone text-ink min-h-screen">
      <UtilityBar />
      <Ticker />
      <Masthead />
      <Hero />
      <SectionHeader
        num="§ 02"
        title="Best new this week."
        right={<>Sorted by score · <a href="#" className="text-vermil hover:underline">View all 47 →</a></>}
      />
      <ReviewsGrid />
      <Manifesto />
      <FromTheArchive />
      <ArchiveTimeline />
      <LatestList />
      <Footer />
    </div>
  );
}
