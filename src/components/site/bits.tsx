import { Link } from "@tanstack/react-router";
import type { Review } from "@/lib/cd-data";
import { Cover } from "./Cover";

export function Kicker({ children, color = "vermil" }: { children: React.ReactNode; color?: "vermil" | "acid" }) {
  const colorClass = color === "acid" ? "text-acid" : "text-vermil";
  const lineColor = color === "acid" ? "bg-acid" : "bg-vermil";
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase">
      <span className={`inline-block w-6 h-px ${lineColor}`} />
      <span className={colorClass}>{children}</span>
    </div>
  );
}

export function PageHead({
  num, title, dek, right,
}: { num: string; title: string; dek?: string; right?: React.ReactNode }) {
  return (
    <section className="border-b border-rule bg-bone">
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-1 font-mono text-[11px] tracking-[0.25em] text-vermil">{num}</div>
        <div className="col-span-12 md:col-span-7 space-y-4">
          <h1 className="fr-display text-[52px] md:text-[80px] text-ink">{title}</h1>
          {dek && <p className="fr-dek text-[18px] md:text-[20px] text-ink-2 max-w-[58ch]">{dek}</p>}
        </div>
        {right && (
          <div className="col-span-12 md:col-span-4 font-mono text-[10px] tracking-[0.2em] uppercase text-mute md:text-right space-y-1">
            {right}
          </div>
        )}
      </div>
    </section>
  );
}

export function ReviewCard({ r, hi }: { r: Review; hi?: boolean }) {
  const badge = r.kind === "bnm" ? "BEST NEW MUSIC" : r.kind === "bnr" ? "BEST NEW REISSUE" : null;
  const highlighted = hi ?? r.kind !== "review";
  return (
    <Link
      to="/reviews/$slug"
      params={{ slug: r.slug }}
      className="group border-t border-rule pt-5 flex flex-col gap-4 hover:bg-bone-2 transition-colors -mx-2 px-2 pb-2"
    >
      <div className={`art ${r.art}`} />
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-mute">
        <span className={highlighted ? "text-vermil" : ""}>{r.genre}</span>
        <span>{r.date}</span>
      </div>
      <div className="space-y-2">
        {badge && (
          <div className="inline-block bg-ink text-acid font-mono text-[9px] tracking-[0.25em] uppercase px-2 py-1">
            {badge}
          </div>
        )}
        <h4 className="fr-card-title text-[28px] text-ink">{r.title}</h4>
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-2">{r.artist}</p>
      </div>
      <div className="flex items-end justify-between border-t border-rule pt-3 mt-auto">
        <div className={`fr-score-card text-[52px] ${highlighted ? "text-vermil" : "text-ink"}`}>
          {r.score.toFixed(1)}<span className="text-[18px] text-mute align-top">/10</span>
        </div>
        <div className="text-right font-mono text-[10px] tracking-[0.18em] uppercase text-mute leading-relaxed">
          <div>{r.label}</div>
          <div>{r.format}</div>
        </div>
      </div>
    </Link>
  );
}
