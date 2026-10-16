import { PageHead } from "@/components/site/bits";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  listNewsletterIssues,
  subscribeToBeehiiv,
  type NewsletterIssue,
} from "@/lib/beehiiv.functions";
import { cdActions } from "@/lib/cd-store";
import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";

const emailSchema = z.string().trim().email().max(255);

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export const Route = createFileRoute("/newsletter")({
  staticData: { sitemap: true },
  loader: () => listNewsletterIssues(),
  component: NewsletterPage,
  head: () =>
    pageMeta(
      "The Mailer — cdreviews.",
      "Liner notes for your inbox. Read past issues of the cdreviews newsletter and subscribe.",
    ),
});

function IssueRow({ issue }: { issue: NewsletterIssue }) {
  const date = formatDate(issue.publishedAt);
  return (
    <a
      href={issue.webUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2 md:gap-6 items-baseline py-6 border-b border-rule"
    >
      <span className="font-mono text-[12px] tracking-[0.12em] uppercase text-mute">{date}</span>
      <span>
        <span className="fr-display-bold text-[22px] text-ink group-hover:text-vermil transition-colors block">
          {issue.title}
        </span>
        {issue.previewText ? (
          <span className="block text-[15px] text-mute mt-1 max-w-[64ch]">{issue.previewText}</span>
        ) : null}
      </span>
      <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil whitespace-nowrap">
        Read ↗
      </span>
    </a>
  );
}

function NewsletterPage() {
  const result = Route.useLoaderData();
  const issues = result.ok ? result.issues : [];
  const failed = !result.ok ? result.error : null;

  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) {
      setStatus("err");
      return;
    }
    cdActions.addSubscriber(parsed.data);
    const sub = await subscribeToBeehiiv({ data: { email: parsed.data } });
    if (!sub.ok) {
      setStatus("err");
      return;
    }
    setValue("");
    setStatus("ok");
    setTimeout(() => setStatus("idle"), 2400);
  }

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead
        num="The Mailer"
        title="Liner notes for your inbox."
        dek="A weekly letter from the editor. Reviews, dispatches, the occasional argument. Read past issues below, or subscribe to get the next one first."
        right={<div>{issues.length} {issues.length === 1 ? "issue" : "issues"}</div>}
      />

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        {failed ? (
          <p className="font-mono text-[12px] tracking-[0.12em] uppercase text-mute py-6">{failed}</p>
        ) : issues.length === 0 ? (
          <p className="text-[17px] text-mute py-6 max-w-[52ch]">
            No issues on the racks yet. Subscribe and the first one lands in your inbox the moment it ships.
          </p>
        ) : (
          <div>
            {issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        <div className="relative overflow-hidden bg-vermil text-night p-8 md:p-12 mt-14">
          <div className="cd-disc spin-slow absolute -right-28 -top-28 w-[280px] h-[280px] opacity-35" aria-hidden="true" />
          <div className="relative">
            <div className="font-mono text-[12px] tracking-[0.12em] uppercase">Subscribe · free</div>
            <h2 className="fr-display text-[32px] md:text-[44px] mt-3">
              Get the next issue <span className="serif-it">first.</span>
            </h2>
            <form className="relative mt-6 flex flex-wrap gap-3 max-w-[560px]" onSubmit={onSubmit}>
              <label htmlFor="newsletter-page-email" className="sr-only">Email address</label>
              <input
                id="newsletter-page-email"
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
        </div>

        <p className="mt-8 font-mono text-[12px] tracking-[0.12em] uppercase text-mute">
          <a href="https://cdreviews.beehiiv.com" target="_blank" rel="noopener noreferrer" className="hover:text-vermil">
            cdreviews.beehiiv.com ↗
          </a>
          {" · "}
          <a href="/api/public/rss.xml" className="hover:text-vermil">
            Review feed (RSS)
          </a>
          {" · "}
          <Link to="/contribute" className="hover:text-vermil">
            Write for us
          </Link>
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
