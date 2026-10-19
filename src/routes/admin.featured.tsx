import { formatScore } from "@/lib/cd-data";
import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCdStore } from "@/lib/cd-store";
import { currentSlot, featuredQueryKey, useFeaturedSlots } from "@/lib/featured";

export const Route = createFileRoute("/admin/featured")({
  staticData: { sitemap: false },
  component: AdminFeatured,
  head: () => pageMeta("Featured review — Admin — cdreviews.", "Featured review on the cdreviews editorial desk."),
});

function AdminFeatured() {
  const reviews = useCdStore((s) => s.reviews);
  const { data: slots = [] } = useFeaturedSlots();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [blurb, setBlurb] = useState("");
  const [when, setWhen] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const bySlug = useMemo(() => new Map(reviews.map((r) => [r.slug, r])), [reviews]);
  const published = new Set(reviews.filter((r) => r.status === "published").map((r) => r.slug));
  const live = currentSlot(slots, published);
  const matches = q.trim().length < 2 ? [] : reviews.filter((r) =>
    `${r.artist} ${r.title} ${r.label}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  const picked = slug ? bySlug.get(slug) : undefined;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return setMsg("Pick a review first.");
    const starts = when ? new Date(when).toISOString() : new Date().toISOString();
    const { error } = await supabase.from("featured_slots").insert({
      review_slug: slug, headline: headline.trim() || null, blurb: blurb.trim() || null, starts_at: starts,
    });
    if (error) return setMsg(`Couldn't save: ${error.message}`);
    await qc.invalidateQueries({ queryKey: featuredQueryKey });
    setMsg(when ? `Scheduled for ${new Date(starts).toLocaleString()}.` : "Now featured on the homepage.");
    setSlug(null); setHeadline(""); setBlurb(""); setWhen(""); setQ("");
  }

  async function remove(id: string) {
    if (!confirm("Remove this feature?")) return;
    await supabase.from("featured_slots").delete().eq("id", id);
    await qc.invalidateQueries({ queryKey: featuredQueryKey });
  }

  const label = "font-mono text-[11px] uppercase tracking-[0.12em] text-mute";
  const field = "w-full min-w-0 max-w-full bg-bone border border-rule px-3 py-2.5 text-ink";
  const now = Date.now();
  return (
    <div className="space-y-8 max-w-[760px]">
      <h1 className="fr-display text-[40px]">Featured review</h1>
      <p className="text-ink-2">The big review at the top of the homepage. Pick one now, or set a date and it swaps in automatically.</p>

      <form onSubmit={save} className="space-y-5 border border-rule p-5">
        <label className="block space-y-1.5">
          <span className={label}>Search reviews</span>
          <input className={field} value={q} onChange={(e) => { setQ(e.target.value); setSlug(null); }} placeholder="Artist, album or label" />
        </label>
        {picked ? (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center border border-vermil px-3 py-2">
            <span className="min-w-0 break-words">{picked.artist} — <em>{picked.title}</em> {picked.status !== "published" && <span className="text-vermil text-sm">(draft — won't show until published)</span>}</span>
            <button type="button" className="text-sm underline" onClick={() => setSlug(null)}>Change</button>
          </div>
        ) : matches.length > 0 && (
          <ul className="max-h-[300px] overflow-y-auto border border-rule divide-y divide-rule">
            {matches.map((r) => (
              <li key={r.slug}>
                <button type="button" className="w-full text-left px-3 py-2 hover:bg-bone" onClick={() => setSlug(r.slug)}>
                  {r.artist} — <em>{r.title}</em> <span className="text-mute text-sm">· {formatScore(r.score)} · {r.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="block space-y-1.5">
          <span className={label}>Headline (optional)</span>
          <input className={field} value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={120} placeholder="Defaults to Artist — Album" />
        </label>
        <label className="block space-y-1.5">
          <span className={label}>Short intro (optional)</span>
          <textarea className={field} rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} maxLength={400} placeholder="Defaults to the review's opening lines" />
        </label>
        <label className="block space-y-1.5">
          <span className={label}>Start date & time (leave empty for now)</span>
          <input type="datetime-local" className={field} value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <button className="h-[46px] px-6 bg-vermil text-night font-bold">{when ? "Schedule feature" : "Feature now"}</button>
        {msg && <p className="text-sm text-ink-2">{msg}</p>}
      </form>

      <section className="space-y-3">
        <h2 className={label}>Schedule</h2>
        {slots.length === 0 && <p className="text-mute">Nothing scheduled — the homepage shows the default pick.</p>}
        <ul className="divide-y divide-rule border border-rule">
          {slots.map((s) => {
            const r = bySlug.get(s.review_slug);
            const status = s.id === live?.id ? "Live now" : +new Date(s.starts_at) > now ? "Upcoming" : "Past";
            return (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 px-3 py-2">
                <span><span className={`${label} mr-2 ${status === "Live now" ? "text-vermil" : ""}`}>{status}</span>
                  {r ? <>{r.artist} — <em>{r.title}</em></> : s.review_slug}
                  <span className="text-mute text-sm"> · {new Date(s.starts_at).toLocaleString()}</span></span>
                <button className="text-sm underline" onClick={() => remove(s.id)}>Remove</button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
