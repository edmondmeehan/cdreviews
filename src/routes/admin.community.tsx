import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminButton, AdminHeader, inputCls } from "@/components/admin/bits";
import { useAuth } from "@/lib/auth";
import {
  listCommunityMatches, matchUncheckedBatch, updateCommunityMatch, type CommunityRow,
} from "@/lib/community-admin.functions";

export const Route = createFileRoute("/admin/community")({
  staticData: { sitemap: false },
  head: () => pageMeta("Community reviews — Admin — cdreviews.", "MusicBrainz matches and CritiqueBrainz reader reviews for each album."),
  component: CommunityAdmin,
});

type Filter = "all" | "reviews" | "rating" | "empty" | "nomatch" | "unchecked" | "hidden";
const FILTERS: Array<[Filter, string, (r: CommunityRow) => boolean]> = [
  ["all", "All", () => true],
  ["reviews", "Showing reviews", (r) => r.state === "matched" && r.reviewCount > 0],
  ["rating", "Rating only", (r) => r.state === "matched" && r.reviewCount === 0 && r.rating != null],
  ["empty", "Matched, nothing to show", (r) => r.state === "matched" && r.reviewCount === 0 && r.rating == null],
  ["nomatch", "No match found", (r) => r.state === "nomatch"],
  ["unchecked", "Not checked yet", (r) => r.state === "unchecked"],
  ["hidden", "Hidden by an editor", (r) => r.state === "hidden"],
];
const PAGE = 50;
const pill = (on: boolean) =>
  `font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border ${on ? "bg-ink text-bone border-ink" : "border-ink/20 text-ink/70 hover:text-ink"}`;

function StatusLine({ r }: { r: CommunityRow }) {
  if (r.state === "unchecked") return <span className="text-ink/50">Not checked yet — matches the first time someone opens the review</span>;
  if (r.state === "hidden") return <span className="text-ink/50">Hidden by an editor</span>;
  if (r.state === "nomatch") return <span className="text-ink/50">No confident match on MusicBrainz</span>;
  return (
    <span className="text-ink/70">
      <a href={`https://musicbrainz.org/release-group/${r.releaseGroupId}`} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-vermil">
        {r.matchedTitle || "MusicBrainz album"} ↗
      </a>
      {" · "}
      {r.reviewCount > 0 ? <span className="text-vermil">{r.reviewCount} review{r.reviewCount === 1 ? "" : "s"}</span> : "no usable reviews"}
      {r.rating != null && <> · ★ {r.rating.toFixed(1)}/5 ({r.ratingCount})</>}
    </span>
  );
}

function Row({ r, onDone }: { r: CommunityRow; onDone: (msg: { kind: "ok" | "err"; text: string }) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const m = useMutation({
    mutationFn: (vars: { action: "set" | "hide" | "recheck"; value?: string }) =>
      updateCommunityMatch({ data: { reviewId: r.reviewId, ...vars } }),
    onSuccess: (res) => { setEditing(false); setValue(""); onDone({ kind: "ok", text: `${r.artist} — ${r.title}: ${res.message}` }); },
    onError: (e: Error) => onDone({ kind: "err", text: `${r.artist} — ${r.title}: ${e.message}` }),
  });
  const btn = "font-mono text-[10px] tracking-[0.15em] uppercase text-ink/60 hover:text-vermil disabled:opacity-40";
  return (
    <li className="py-4 border-b border-ink/10 grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Link to="/reviews/$slug" params={{ slug: r.slug }} target="_blank" className="font-serif text-[18px] text-ink hover:text-vermil min-w-0">
          {r.artist} — <span className="italic">{r.title}</span>
        </Link>
        <div className="flex flex-wrap gap-4">
          <button type="button" className={btn} disabled={m.isPending} onClick={() => setEditing((v) => !v)}>Set match</button>
          <button type="button" className={btn} disabled={m.isPending} onClick={() => m.mutate({ action: "recheck" })}>
            {m.isPending ? "Working…" : r.state === "hidden" ? "Unhide & re-check" : "Re-check"}
          </button>
          {r.state !== "hidden" && (
            <button type="button" className={btn} disabled={m.isPending} onClick={() => m.mutate({ action: "hide" })}>Hide</button>
          )}
        </div>
      </div>
      <div className="font-mono text-[11px]"><StatusLine r={r} /></div>
      {editing && (
        <form
          className="flex flex-wrap gap-2 items-center"
          onSubmit={(e) => { e.preventDefault(); m.mutate({ action: "set", value }); }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste musicbrainz.org/release-group/… link"
            className={`${inputCls} sm:max-w-[460px]`}
            aria-label="MusicBrainz release-group link"
          />
          <AdminButton type="submit" disabled={m.isPending || !value.trim()}>Save match</AdminButton>
          <a
            href={`https://musicbrainz.org/search?type=release_group&query=${encodeURIComponent(`${r.title} ${r.artist}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-vermil hover:underline"
          >
            Search MusicBrainz ↗
          </a>
        </form>
      )}
    </li>
  );
}

function CommunityAdmin() {
  const { isStaff, loading } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("reviews");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const rowsQ = useQuery({ queryKey: ["admin", "community"], queryFn: () => listCommunityMatches(), enabled: isStaff });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "community"] });
  const batch = useMutation({
    mutationFn: () => matchUncheckedBatch({ data: { limit: 10 } }),
    onSuccess: (r) => {
      setMsg({ kind: "ok", text: r.checked === 0 ? "Every published review has been checked." :
        `Checked ${r.checked}: ${r.matched} matched, ${r.unmatched} no match${r.failed ? `, ${r.failed} couldn't reach MusicBrainz` : ""}.` });
      refresh();
    },
    onError: (e: Error) => setMsg({ kind: "err", text: e.message }),
  });

  const rows = rowsQ.data ?? [];
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(([k, , f]) => [k, rows.filter(f).length])), [rows]);
  const visible = useMemo(() => {
    const test = FILTERS.find(([k]) => k === filter)![2];
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => test(r) && (!needle || `${r.artist} ${r.title}`.toLowerCase().includes(needle)));
  }, [rows, filter, q]);

  if (loading) return <p className="font-mono text-[11px] text-ink/50">Loading…</p>;
  if (!isStaff) {
    return (
      <div>
        <AdminHeader title="Community reviews" />
        <p className="font-mono text-[11px] text-ink/60">Editor or admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Community reviews"
        action={<AdminButton onClick={() => batch.mutate()} disabled={batch.isPending || !counts.unchecked}>
          {batch.isPending ? "Checking… (about 20s)" : `Match next 10 unchecked`}
        </AdminButton>}
      />
      <p className="font-mono text-[11px] text-ink/60 max-w-[75ch] leading-relaxed">
        Each review is matched to its album on MusicBrainz, and reader reviews from CritiqueBrainz show in the
        “From the community” section of the review page. Only reviews licensed for commercial use (CC BY-SA) are shown.
        If an album is matched wrong, use <b>Set match</b> with the right MusicBrainz release-group link, or <b>Hide</b> the section for that review.
        Changes can take up to an hour to appear for every visitor.
      </p>

      {msg && <p className={`font-mono text-[11px] ${msg.kind === "ok" ? "text-ink" : "text-vermil"}`} role="status">{msg.text}</p>}

      <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={filter === key} className={pill(filter === key)}
            onClick={() => { setFilter(key); setShown(PAGE); }}>
            {label} {rowsQ.data ? <span className="opacity-60">{counts[key]}</span> : null}
          </button>
        ))}
      </div>
      <input value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder="Search artist or album"
        className={`${inputCls} max-w-[360px]`} aria-label="Search artist or album" />

      {rowsQ.isLoading ? (
        <p className="font-mono text-[11px] text-ink/50">Loading…</p>
      ) : rowsQ.error ? (
        <p className="font-mono text-[11px] text-vermil">{(rowsQ.error as Error).message}</p>
      ) : visible.length === 0 ? (
        <p className="font-mono text-[11px] text-ink/50">Nothing here.</p>
      ) : (
        <>
          <ul>{visible.slice(0, shown).map((r) => <Row key={r.reviewId} r={r} onDone={(m) => { setMsg(m); refresh(); }} />)}</ul>
          {visible.length > shown && (
            <AdminButton tone="ghost" onClick={() => setShown((n) => n + PAGE)}>Show more ({visible.length - shown} left)</AdminButton>
          )}
        </>
      )}
    </div>
  );
}
