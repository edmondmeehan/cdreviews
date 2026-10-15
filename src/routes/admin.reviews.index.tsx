import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { useAuth } from "@/lib/auth";
import {
  REVIEWS_PAGE_SIZE, filterReviews, paginate, pageWindow,
} from "@/lib/review-admin-list";
import { AdminHeader, AdminButton, AdminLinkButton } from "@/components/admin/bits";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  page: fallback(z.number().int(), 1).default(1),
});

export const Route = createFileRoute("/admin/reviews/")({
  validateSearch: zodValidator(schema),
  head: () => pageMeta("Reviews desk — Admin — cdreviews.", "Reviews desk on the cdreviews editorial desk."),
  component: ReviewsAdmin,
});

function ReviewsAdmin() {
  const reviews = useCdStore((s) => s.reviews);
  const { canPublish } = useAuth();
  const { q, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/reviews/" });
  const [term, setTerm] = useState(q);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // Typing filters after a short pause; the URL keeps the query so the view is
  // shareable and survives a reload.
  useEffect(() => { setTerm(q); }, [q]);
  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => navigate({ search: (prev) => ({ ...prev, q: term, page: 1 }), replace: true }), 250);
    return () => clearTimeout(t);
  }, [term, q, navigate]);

  const filtered = filterReviews(reviews, q);
  const paged = paginate(filtered, page, REVIEWS_PAGE_SIZE);
  // A stale ?page= from a bookmark or a shrinking result set: make the URL honest.
  useEffect(() => {
    if (paged.page !== page) navigate({ search: (prev) => ({ ...prev, page: paged.page }), replace: true });
  }, [paged.page, page, navigate]);

  const pageIds = paged.items.map((r) => r.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  function toggle(id: string) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  // Selects the rows currently on screen, so paging or searching never hides
  // what you're about to act on.
  function toggleAll() {
    setSelected((prev) => {
      const n = new Set(prev);
      if (allSelected) pageIds.forEach((id) => n.delete(id));
      else pageIds.forEach((id) => n.add(id));
      return n;
    });
  }

  async function run(kind: "publish" | "unpublish" | "delete") {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (kind === "delete" && !confirm(`Delete ${ids.length} review(s)? This can't be undone.`)) return;
    setBusy(true);
    const res = kind === "delete" ? await cdActions.deleteReviews(ids)
      : await cdActions.setReviewsStatus(ids, kind === "publish" ? "published" : "draft");
    setBusy(false);
    if (res.error) alert(res.error); else setSelected(new Set());
  }

  const go = (p: number) => navigate({ search: (prev) => ({ ...prev, page: p }) });

  return (
    <div>
      <AdminHeader title="Reviews" action={
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/reviews/import" className="font-mono text-[10px] tracking-[0.25em] uppercase px-4 py-2 border bg-ink/0 text-ink/70 border-ink/20 hover:text-ink">↑ Bulk import</Link>
          <AdminLinkButton to="/admin/reviews/$id" params={{ id: "new" }}>+ New review</AdminLinkButton>
        </div>
      } />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full max-w-[420px]">
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            maxLength={80}
            placeholder="Artist, album, label, genre, status…"
            aria-label="Search reviews"
            className="flex-1 min-w-0 bg-bone border border-ink/20 text-ink px-3 py-2 font-mono text-[16px] sm:text-[12px] outline-none focus:border-vermil"
          />
          {q && (
            <button onClick={() => setTerm("")} className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 hover:text-vermil shrink-0">
              Clear
            </button>
          )}
        </div>
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50">
          {paged.total === 0
            ? "No matches"
            : <>Showing {paged.from}–{paged.to} of {paged.total}{q.trim() ? ` matching “${q.trim()}”` : ""} · {reviews.length} total</>}
        </div>
      </div>

      {canPublish && selected.size > 0 && (
        <div className="sticky top-0 z-10 bg-bone border border-ink/10 p-3 mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">{selected.size} selected</span>
          <AdminButton onClick={() => !busy && run("publish")}>Publish</AdminButton>
          <AdminButton tone="ghost" onClick={() => !busy && run("unpublish")}>Unpublish</AdminButton>
          <AdminButton tone="danger" onClick={() => !busy && run("delete")}>Delete</AdminButton>
          <AdminButton tone="ghost" onClick={() => setSelected(new Set())}>Clear</AdminButton>
        </div>
      )}
      <div className="overflow-x-auto sm:-mx-6 sm:px-6">
      <table className="mobile-review-table w-full sm:min-w-[640px] font-mono text-[11px]">
        <thead>
          <tr className="text-left text-ink/50 tracking-[0.2em] uppercase text-[10px] border-b border-ink/10">
            {canPublish && <th className="py-3 w-8"><label className="inline-flex items-center gap-3"><input type="checkbox" aria-label="Select all on this page" checked={allSelected} onChange={toggleAll} /><span className="sm:hidden">Select all on this page</span></label></th>}
            <th className="py-3">Title</th><th>Artist</th><th>Score</th><th>Type</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {paged.items.map((r) => (
            <tr key={r.id} className="border-b border-ink/5 hover:bg-ink/5">
              {canPublish && <td className="py-3"><input type="checkbox" aria-label={`Select ${r.title}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td>}
              <td className="py-3"><Link to="/admin/reviews/$id" params={{ id: r.id }} className="text-ink hover:text-vermil">{r.title}</Link></td>
              <td data-label="Artist" className="text-ink/70">{r.artist}</td>
              <td data-label="Score" className={r.score >= 8.5 ? "text-vermil" : "text-ink/70"}>{formatScore(r.score)}</td>
              <td data-label="Type" className="uppercase text-ink/70">{r.kind}</td>
              <td data-label="Status" className={r.status === "published" ? "text-acid" : "text-ink/40"}>{r.status === "draft" && r.publishAt ? `scheduled ${new Date(r.publishAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : r.status === "draft" && r.submittedAt ? "awaiting approval" : r.status}</td>
              <td className="text-right">
                {canPublish && <AdminButton tone="danger" onClick={() => { if (confirm(`Delete "${r.title}"?`)) cdActions.deleteReview(r.id); }}>Delete</AdminButton>}
              </td>
            </tr>
          ))}
          {paged.items.length === 0 && (
            <tr>
              <td colSpan={canPublish ? 7 : 6} className="py-10 text-center text-ink/50">
                Nothing matches “{q.trim()}”. <button onClick={() => setTerm("")} className="text-vermil hover:underline">Clear search</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {paged.pageCount > 1 && (
        <div className="flex flex-wrap items-center gap-2 mt-6 font-mono text-[10px] tracking-[0.2em] uppercase">
          <button onClick={() => go(paged.page - 1)} disabled={paged.page === 1} className="px-3 py-2 border border-ink/20 text-ink/70 hover:text-ink disabled:opacity-30">← Prev</button>
          {pageWindow(paged.page, paged.pageCount).map((p, i) =>
            p === "…"
              ? <span key={`gap-${i}`} className="px-2 text-ink/30">…</span>
              : <button key={p} onClick={() => go(p)} aria-current={p === paged.page ? "page" : undefined}
                  className={`px-3 py-2 border ${p === paged.page ? "bg-ink text-bone border-ink" : "border-ink/20 text-ink/70 hover:text-ink"}`}>
                  {p}
                </button>,
          )}
          <button onClick={() => go(paged.page + 1)} disabled={paged.page === paged.pageCount} className="px-3 py-2 border border-ink/20 text-ink/70 hover:text-ink disabled:opacity-30">Next →</button>
          <span className="text-ink/40 normal-case ml-2">
            {REVIEWS_PAGE_SIZE} per page · page {paged.page} of {paged.pageCount}
          </span>
        </div>
      )}
    </div>
  );
}
