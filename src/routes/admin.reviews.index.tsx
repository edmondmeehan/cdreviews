import { createFileRoute, Link } from "@tanstack/react-router";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton, AdminLinkButton } from "@/components/admin/bits";

export const Route = createFileRoute("/admin/reviews/")({ component: ReviewsAdmin });

function ReviewsAdmin() {
  const reviews = useCdStore((s) => s.reviews);
  return (
    <div>
      <AdminHeader title="Reviews" action={<AdminLinkButton to="/admin/reviews/$id" params={{ id: "new" }}>+ New review</AdminLinkButton>} />
      <table className="w-full font-mono text-[11px]">
        <thead>
          <tr className="text-left text-bone/50 tracking-[0.2em] uppercase text-[10px] border-b border-bone/10">
            <th className="py-3">Title</th><th>Artist</th><th>Score</th><th>Type</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-b border-bone/5 hover:bg-bone/5">
              <td className="py-3"><Link to="/admin/reviews/$id" params={{ id: r.id }} className="text-bone hover:text-vermil">{r.title}</Link></td>
              <td className="text-bone/70">{r.artist}</td>
              <td className={r.score >= 8.5 ? "text-vermil" : "text-bone/70"}>{r.score.toFixed(1)}</td>
              <td className="uppercase text-bone/70">{r.kind}</td>
              <td className={r.status === "published" ? "text-acid" : "text-bone/40"}>{r.status}</td>
              <td className="text-right">
                <AdminButton tone="danger" onClick={() => { if (confirm(`Delete "${r.title}"?`)) cdActions.deleteReview(r.id); }}>Delete</AdminButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
