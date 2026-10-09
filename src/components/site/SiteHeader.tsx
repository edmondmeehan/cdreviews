import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { NAV_LINKS } from "@/lib/cd-data";
import { useCdStore } from "@/lib/cd-store";

const WORDMARK = "cdreviews".split("");

function EqBars({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-end gap-[3px] h-[18px] ${className}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((k) => (
        <span
          key={k}
          className="eq-bar block w-[3px] h-[18px] bg-vermil"
          style={{ animationDelay: `${k * 0.17}s` }}
        />
      ))}
    </span>
  );
}

/** Thin top bar: CDR Radio "now spinning" + account links. */
function RadioBar() {
  const nowSpinning = useCdStore((s) =>
    [...s.reviews].filter((r) => r.status === "published").sort((a, b) => b.score - a.score)[0],
  );
  return (
    <div className="border-b border-rule bg-bone relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link
          to="/radio"
          className="flex items-center gap-2.5 bg-ink text-bone rounded-full pl-1.5 pr-4 h-11 font-mono text-[11px] tracking-[0.12em] uppercase hover:bg-vermil hover:text-bone transition-colors"
        >
          <span className="cd-disc spin block w-8 h-8" aria-hidden="true" />
          CDR Radio
        </Link>
        <EqBars className="hidden sm:flex" />
        <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.12em] uppercase text-mute flex-1 min-w-[200px]">
          <span className="text-vermil">On air</span>
          {nowSpinning && (
            <Link
              to="/reviews/$slug"
              params={{ slug: nowSpinning.slug }}
              className="text-ink truncate hover:text-vermil"
            >
              Now: {nowSpinning.artist} — {nowSpinning.title}
            </Link>
          )}
        </div>
        <nav aria-label="Account" className="hidden sm:flex items-center gap-6 font-mono text-[11px] tracking-[0.12em] uppercase text-ink-2">
          <Link to="/archive" className="hover:text-vermil">Search</Link>
          <a href="#mailer" className="hover:text-vermil">Subscribe</a>
          <Link to="/admin" className="hover:text-vermil">Account</Link>
        </nav>
      </div>
    </div>
  );
}

function Masthead() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isHome = pathname === "/";
  return (
    <header className="bg-bone">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 md:pt-10">
        <div className="flex flex-wrap justify-between gap-3 font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
          <span>Independent music criticism</span>
          <span className="hidden sm:inline">Est. 1995 · New York</span>
          <span>Vol. 31</span>
        </div>
        <div className="flex items-end gap-4 md:gap-6 mt-1">
          <Link to="/" aria-label="cdreviews — home" className="block min-w-0">
            <span
              className={`block fr-display-bold text-ink whitespace-nowrap ${
                isHome
                  ? "text-[clamp(64px,15.5vw,236px)]"
                  : "text-[clamp(56px,9vw,128px)]"
              }`}
              aria-hidden="true"
            >
              {WORDMARK.map((l, i) => (
                <span key={i} className="wm-letter">{l}</span>
              ))}
              <span className="text-vermil">.</span>
            </span>
          </Link>
          <span
            className={`cd-disc spin flex-none mb-1 ${
              isHome ? "w-[clamp(56px,11vw,168px)] h-[clamp(56px,11vw,168px)]" : "w-[clamp(44px,6vw,88px)] h-[clamp(44px,6vw,88px)]"
            }`}
            aria-hidden="true"
          />
        </div>
        <nav
          aria-label="Sections"
          className="mt-7 md:mt-8 border-t-2 border-ink border-b border-b-rule flex items-center gap-x-8 gap-y-2 py-4 overflow-x-auto"
        >
          {NAV_LINKS.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.label}
                to={l.to}
                className={`font-mono text-[12px] tracking-[0.12em] uppercase whitespace-nowrap ${
                  active ? "text-vermil" : "text-ink hover:text-vermil"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <RandomLink />
        </nav>
      </div>
    </header>
  );
}

/** "Random from the vault" — jumps to a random published review. */
function RandomLink() {
  const slugs = useCdStore((s) => s.reviews.filter((r) => r.status === "published").map((r) => r.slug));
  const navigate = useNavigate();
  if (slugs.length === 0) return null;
  return (
    <button
      type="button"
      onClick={() => {
        const pick = slugs[Math.floor(Math.random() * slugs.length)];
        navigate({ to: "/reviews/$slug", params: { slug: pick } });
      }}
      className="ml-auto font-mono text-[12px] tracking-[0.12em] uppercase whitespace-nowrap text-mute hover:text-vermil cursor-pointer"
    >
      Random from the vault ↻
    </button>
  );
}

export function SiteHeader() {
  return (
    <>
      <RadioBar />
      <Masthead />
    </>
  );
}
