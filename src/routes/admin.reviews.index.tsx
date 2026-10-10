import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { useAuth } from "@/lib/auth";
import { AdminHeader, AdminButton, AdminLinkButton } from "@/components/admin/bits";

export const Route = createFileRoute("/admin/reviews/")({ component: ReviewsAdmin });

function ReviewsAdmin() {
  const reviews = useCdStore((s) => s.reviews);
  const { canPublish } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const allSelected = reviews.length > 0 && reviews.every((r) => selected.has(r.id));
  function toggle(id: string) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleAll() { setSelected(allSelected ? new Set() : new Set(reviews.map((r) => r.id))); }

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

  return (
    <div>
      <AdminHeader title="Reviews" action={
        <div className="flex gap-2">
          <Link to="/admin/reviews/import" className="font-mono text-[10px] tracking-[0.25em] uppercase px-4 py-2 border bg-ink/0 text-ink/70 border-ink/20 hover:text-ink">↑ Bulk import</Link>
          <AdminLinkButton to="/admin/reviews/$id" params={{ id: "new" }}>+ New review</AdminLinkButton>
        </div>
      } />
      {canPublish && selected.size > 0 && (
        <div className="sticky top-0 z-10 bg-bone border border-ink/10 p-3 mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70">{selected.size} selected</span>
          <AdminButton onClick={() => !busy && run("publish")}>Publish</AdminButton>
          <AdminButton tone="ghost" onClick={() => !busy && run("unpublish")}>Unpublish</AdminButton>
          <AdminButton tone="danger" onClick={() => !busy && run("delete")}>Delete</AdminButton>
          <AdminButton tone="ghost" onClick={() => setSelected(new Set())}>Clear</AdminButton>
        </div>
      )}
      <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-[640px] font-mono text-[11px]">
        <thead>
          <tr className="text-left text-ink/50 tracking-[0.2em] uppercase text-[10px] border-b border-ink/10">
            {canPublish && <th className="py-3 w-8"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAll} /></th>}
            <th className="py-3">Title</th><th>Artist</th><th>Score</th><th>Type</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-b border-ink/5 hover:bg-ink/5">
              {canPublish && <td className="py-3"><input type="checkbox" aria-label={`Select ${r.title}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td>}
              <td className="py-3"><Link to="/admin/reviews/$id" params={{ id: r.id }} className="text-ink hover:text-vermil">{r.title}</Link></td>
              <td className="text-ink/70">{r.artist}</td>
              <td className={r.score >= 8.5 ? "text-vermil" : "text-ink/70"}>{r.score.toFixed(1)}</td>
              <td className="uppercase text-ink/70">{r.kind}</td>
              <td className={r.status === "published" ? "text-acid" : "text-ink/40"}>{r.status === "draft" && r.submittedAt ? "awaiting approval" : r.status}</td>
              <td className="text-right">
                {canPublish && <AdminButton tone="danger" onClick={() => { if (confirm(`Delete "${r.title}"?`)) cdActions.deleteReview(r.id); }}>Delete</AdminButton>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
