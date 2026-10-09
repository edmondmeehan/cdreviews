import { Link } from "@tanstack/react-router";
import type { Review } from "@/lib/cd-data";
import { Cover } from "./Cover";

export function Kicker({ children, color = "vermil" }: { children: React.ReactNode; color?: "vermil" | "acid" }) {
  const colorClass = color === "acid" ? "text-acid" : "text-vermil";
  const lineColor = color === "acid" ? "bg-acid" : "bg-vermil";
  return (
    <div className="flex items-center gap-3 font-mono text-[12px] tracking-[0.12em] uppercase">
      <span className={`inline-block w-8 h-px ${lineColor}`} />
      <span className={colorClass}>{children}</span>
    </div>
  );
}

/** Splits a title so its last word can be set in the italic serif. */
export function SplitTitle({ text }: { text: string }) {
  const trimmed = text.trim();
  const i = trimmed.lastIndexOf(" ");
  if (i < 0) return <>{trimmed}</>;
  return (
    <>
      {trimmed.slice(0, i)} <span className="serif-it">{trimmed.slice(i + 1)}</span>
    </>
  );
}

export function PageHead({
  num, title, dek, right,
}: { num: string; title: string; dek?: string; right?: React.ReactNode }) {
  return (
    <section className="bg-bone">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-12 md:pt-20 md:pb-16 flex flex-wrap gap-8 items-end justify-between border-b border-rule">
        <div className="flex-[1_1_560px] min-w-0 space-y-5">
          <div className="font-mono text-[12px] tracking-[0.12em] text-vermil">{num}</div>
          <h1 className="fr-display text-[56px] md:text-[96px] text-ink"><SplitTitle text={title} /></h1>
          {dek && <p className="fr-dek text-[18px] md:text-[21px] text-ink-2 max-w-[58ch]">{dek}</p>}
        </div>
        {right && (
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute md:text-right space-y-1">
            {right}
          </div>
        )}
      </div>
    </section>
  );
}

const TILTS = ["-2deg", "1.5deg", "-1deg", "2.2deg", "1deg", "-2.4deg", "1.8deg", "-1.2deg"];
function tiltFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TILTS[h % TILTS.length];
}

export function ScoreSticker({ score }: { score: number }) {
  return (
    <span className={`score-sticker ${score >= 9 ? "score-sticker--hot" : ""}`}>
      {score.toFixed(1)}
    </span>
  );
}

export function ReviewCard({ r }: { r: Review; hi?: boolean }) {
  const badge = r.kind === "bnm" ? "Best New Music" : r.kind === "bnr" ? "Best New Reissue" : null;
  return (
    <Link
      to="/reviews/$slug"
      params={{ slug: r.slug }}
      className="group block text-ink hover:text-ink"
    >
      <div className="crate relative" style={{ ["--tilt" as string]: tiltFor(r.id) }}>
        <Cover r={r} pop />
        <ScoreSticker score={r.score} />
      </div>
      <div className="mt-5 flex justify-between gap-3 items-baseline">
        <div className="min-w-0">
          {badge && (
            <div className="inline-block bg-acid text-night font-mono text-[10px] tracking-[0.12em] uppercase px-2 py-1 mb-2">
              {badge}
            </div>
          )}
          <h4 className="fr-card-title text-[27px] group-hover:text-vermil transition-colors">{r.title}</h4>
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute mt-1.5 truncate">{r.artist}</p>
        </div>
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute whitespace-nowrap">{r.date}</span>
      </div>
    </Link>
  );
}

/** Grid wrapper that leaves room above for discs sliding out. */
export function CrateGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20 pt-20">
      {children}
    </div>
  );
}

/** One row of the numbered review index (homepage, archive). */
export function IndexRow({ row, n, showDecade = false }: { row: Review; n: number; showDecade?: boolean }) {
  return (
    <Link
      to="/reviews/$slug"
      params={{ slug: row.slug }}
      className="group row-slide flex flex-wrap items-center gap-x-7 gap-y-2 py-5 px-2 border-b border-rule text-ink hover:text-ink"
    >
      <span className="font-mono text-[12px] text-mute w-10">{String(n).padStart(3, "0")}</span>
      <span className="flex-[1_1_280px] min-w-0">
        <span className="block fr-row-title text-[28px] md:text-[30px]">
          {row.title} <span className="text-vermil opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </span>
        <span className="block font-mono text-[11px] tracking-[0.1em] uppercase text-mute mt-1.5 truncate">{row.artist} · {row.label}</span>
      </span>
      <span className="w-14 font-mono text-[10px] tracking-[0.1em] uppercase">
        {row.kind === "bnm" && <span className="bg-acid text-night px-1.5 py-1">BNM</span>}
        {row.kind === "bnr" && <span className="bg-acid text-night px-1.5 py-1">BNR</span>}
        {row.kind === "review" && <span className="text-mute">Rev</span>}
      </span>
      <span className="hidden md:block w-32 font-mono text-[11px] tracking-[0.1em] uppercase text-ink-2 truncate">{row.genre === "Uncategorized" ? "" : row.genre}</span>
      {showDecade && <span className="hidden md:block w-16 font-mono text-[11px] tracking-[0.1em] uppercase text-mute">{row.decade}</span>}
      <span className="w-28 font-mono text-[11px] tracking-[0.1em] uppercase text-mute">{row.date}</span>
      <span className={`ml-auto w-24 text-right fr-score-card text-[40px] md:text-[44px] ${row.score >= 8.5 ? "text-vermil" : row.score < 7 ? "text-mute" : "text-ink"}`}>
        {row.score.toFixed(1)}
      </span>
    </Link>
  );
}

