import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { cdActions } from "@/lib/cd-store";

const FOOTER_COLS: Array<{ heading: string; links: Array<{ label: string; to: string }> }> = [
  {
    heading: "Read",
    links: [
      { label: "Reviews", to: "/reviews" },
      { label: "Best New", to: "/best-new" },
      { label: "Features", to: "/features" },
      { label: "Lists", to: "/lists" },
      { label: "Archive", to: "/archive" },
    ],
  },
  {
    heading: "Listen",
    links: [
      { label: "CDR Radio", to: "/radio" },
      { label: "From the Archive", to: "/archive" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Masthead", to: "/masthead" },
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const emailSchema = z.string().trim().email().max(255);

export function SiteFooter() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) { setStatus("err"); return; }
    cdActions.addSubscriber(parsed.data);
    setValue("");
    setStatus("ok");
    setTimeout(() => setStatus("idle"), 2400);
  }

  return (
    <footer className="bg-bone text-ink">
      {/* The Mailer */}
      <section id="mailer" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-20">
        <div className="relative overflow-hidden bg-vermil text-night p-8 md:p-14 flex flex-wrap gap-10 items-center justify-between">
          <div className="cd-disc spin-slow absolute -right-36 -top-36 w-[360px] h-[360px] opacity-35" aria-hidden="true" />
          <div className="relative flex-[1_1_420px] min-w-0">
            <div className="font-mono text-[12px] tracking-[0.12em] uppercase">The Mailer · weekly</div>
            <h2 className="fr-display text-[40px] md:text-[60px] mt-4">
              Liner notes for <span className="serif-it">your inbox.</span>
            </h2>
            <p className="mt-4 text-[17px]">A weekly letter from the editor. Reviews, dispatches, the occasional argument.</p>
          </div>
          <form className="relative flex-[1_1_420px] min-w-0 flex flex-wrap gap-3" onSubmit={onSubmit}>
            <label htmlFor="mailer-email" className="sr-only">Email address</label>
            <input
              id="mailer-email"
              type="email"
              required
              autoComplete="email"
              value={value}
              onChange={(e) => { setValue(e.target.value); setStatus("idle"); }}
              placeholder="you@email.com"
              className="flex-[1_1_240px] min-w-0 h-14 px-5 bg-night text-paper font-mono text-[14px] outline-none focus:ring-2 focus:ring-paper"
            />
            <button className="h-14 px-7 border-2 border-night bg-paper text-night font-bold text-[16px] hover:bg-night hover:text-paper transition-colors">
              Subscribe →
            </button>
            <p className="basis-full font-mono text-[11px] tracking-[0.12em] uppercase min-h-[1em]" aria-live="polite">
              {status === "ok" && "→ You're on the list."}
              {status === "err" && "That email doesn't look right."}
            </p>
          </form>
        </div>
      </section>

      <div className="border-t border-rule overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-16">
          <div className="flex flex-wrap gap-12 justify-between">
            <p className="flex-[1_1_300px] max-w-[360px] text-mute text-[15px] leading-relaxed">
              A music review publication of record. Independent since 1995.
            </p>
            {FOOTER_COLS.map((col) => (
              <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-3 text-[15px]">
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil">{col.heading}</span>
                {col.links.map((link) => (
                  <Link key={link.label} to={link.to} className="text-ink hover:text-vermil">
                    {link.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
          <div className="mt-16 pt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
            <span>© 1995 — 2026 cdreviews</span>
            <span>Made in New York · Vol. 31</span>
            <Link to="/admin" className="hover:text-vermil">Admin</Link>
          </div>
          <div
            aria-hidden="true"
            className="fr-display-bold text-[clamp(90px,21vw,320px)] text-bone-2 whitespace-nowrap mt-8 -mb-[0.12em] select-none"
          >
            cdreviews<span className="text-vermil">.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
