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
    <footer id="mailer" className="bg-ink text-bone">
      <div className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 space-y-5">
          <Link to="/" className="block fr-display-bold text-[56px] text-bone leading-none">cdreviews.</Link>
          <p className="fr-dek text-[16px] text-bone/70 max-w-[36ch]">
            A music review publication of record. Independent since 1995. Reading rooms in Brooklyn, Berlin & Tokyo.
          </p>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.heading} className="md:col-span-2 space-y-4">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-acid">{col.heading}</div>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="font-mono text-[11px] text-bone/80 hover:text-vermil tracking-wide">
                    {link.label}
                  </Link>
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
          <form className="flex border border-bone/20" onSubmit={onSubmit}>
            <input
              type="email"
              required
              value={value}
              onChange={(e) => { setValue(e.target.value); setStatus("idle"); }}
              placeholder="@email"
              className="flex-1 min-w-0 bg-transparent border-0 px-3 py-2.5 text-bone font-mono text-[11px] outline-none placeholder:text-bone/40"
            />
            <button className="bg-vermil text-bone font-mono text-[10px] tracking-[0.2em] uppercase px-4 hover:bg-bone hover:text-ink transition-colors">
              Send →
            </button>
          </form>
          {status === "ok" && <p className="font-mono text-[10px] text-acid tracking-[0.2em] uppercase">→ Subscribed.</p>}
          {status === "err" && <p className="font-mono text-[10px] text-vermil tracking-[0.2em] uppercase">Invalid email.</p>}
        </div>
      </div>

      <div className="border-t border-bone/10">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] uppercase text-bone/50">
          <span>© 1995 — 2026 cdreviews</span>
          <span>All rights reserved · Print ISSN 1095‑3814</span>
          <Link to="/admin" className="hover:text-vermil">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
