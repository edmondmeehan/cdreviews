import { Link, useRouterState } from "@tanstack/react-router";
import { NAV_LINKS } from "@/lib/cd-data";
import { useCdStore } from "@/lib/cd-store";

function UtilityBar() {
  return (
    <div className="border-b border-rule bg-bone">
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-ink-2">
        <div>Independent music criticism · Since 1995</div>
        <div className="flex items-center gap-5">
          <Link to="/admin" className="hover:text-vermil">Account</Link>
          <a href="#mailer" className="hover:text-vermil">Subscribe</a>
          <a href="#" className="hover:text-vermil">Search ⌘K</a>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const reviews = useCdStore((s) => s.reviews.slice(0, 8));
  const items = [...reviews, ...reviews];
  return (
    <div className="bg-ink overflow-hidden border-b border-ink">
      <div className="flex animate-marquee whitespace-nowrap py-2.5">
        {items.map((it, i) => {
          const tag = it.kind === "bnm" ? "BNM" : it.kind === "bnr" ? "BNR" : "NEW";
          const tagColor = tag === "NEW" ? "text-vermil" : "text-acid";
          return (
            <Link
              key={`${it.id}-${i}`}
              to="/reviews/$slug"
              params={{ slug: it.slug }}
              className="font-mono text-[11px] text-bone px-6 flex-shrink-0 hover:opacity-80"
            >
              <span className={`${tagColor} mr-2`}>{tag}</span>
              <span className="text-bone/90">{it.artist}</span>
              <span className="text-bone/60"> — {it.title}</span>
              <span className="text-bone/40"> · </span>
              <span className="text-acid">{it.score.toFixed(1)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Masthead() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <header className="border-b border-rule bg-bone">
      <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-4 flex items-end justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <Link to="/" className="block">
            <h1 className="fr-display-bold text-[80px] md:text-[120px] lg:text-[160px] text-ink leading-none">cdreviews.</h1>
          </Link>
          <span className="hidden md:inline font-mono text-[10px] tracking-[0.3em] uppercase text-mute">EST. 1995</span>
        </div>
        <span className="hidden lg:inline font-mono text-[10px] tracking-[0.3em] uppercase text-mute">VOL · 31</span>
      </div>
      <nav className="max-w-[1400px] mx-auto px-6 pb-3 flex items-center gap-7 border-t border-rule pt-3 overflow-x-auto">
        {NAV_LINKS.map((l) => {
          const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
          return (
            <Link
              key={l.label}
              to={l.to}
              className={`font-mono text-[11px] tracking-[0.2em] uppercase whitespace-nowrap ${active ? "text-vermil" : "text-ink-2 hover:text-vermil"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function SiteHeader() {
  return (
    <>
      <UtilityBar />
      <Ticker />
      <Masthead />
    </>
  );
}
