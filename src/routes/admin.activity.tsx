import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminHeader } from "@/components/admin/bits";
import { ActivityList, ENTITY_LABELS, useActivity } from "@/components/admin/RecentChanges";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/activity")({
  staticData: { sitemap: false },
  head: () => pageMeta("Change log — Admin — cdreviews.", "Who changed what on the cdreviews editorial desk."),
  component: ActivityAdmin,
});

function ActivityAdmin() {
  const { isStaff, loading } = useAuth();
  const [entity, setEntity] = useState<string>("");
  const [limit, setLimit] = useState(100);
  const q = useActivity({ limit, entity: entity || undefined });

  if (loading) return <p className="font-mono text-[11px] text-ink/50">Loading…</p>;
  if (!isStaff) {
    return (
      <div>
        <AdminHeader title="Change log" />
        <p className="font-mono text-[11px] text-ink/60">Editor or admin role required.</p>
      </div>
    );
  }

  const options = [["", "Everything"], ...Object.entries(ENTITY_LABELS)];
  return (
    <div className="space-y-6">
      <AdminHeader title="Change log" />
      <p className="font-mono text-[11px] text-ink/60 max-w-[70ch]">
        Every create, edit and delete on reviews, features, lists, contributors, ads, homepage features, radio, site settings and roles — with who made it and when.
      </p>
      <div role="group" aria-label="Filter changes" className="flex flex-wrap gap-2">
        {options.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={entity === key}
            onClick={() => setEntity(key)}
            className={`font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border ${
              entity === key ? "bg-ink text-bone border-ink" : "border-ink/20 text-ink/70 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {q.isLoading ? (
        <p className="font-mono text-[11px] text-ink/50">Loading…</p>
      ) : q.error ? (
        <p className="font-mono text-[11px] text-vermil">{(q.error as Error).message}</p>
      ) : (
        <>
          <ActivityList rows={q.data ?? []} />
          {(q.data?.length ?? 0) >= limit && (
            <button
              type="button"
              onClick={() => setLimit((n) => n + 100)}
              className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border border-ink/20 text-ink/70 hover:text-ink"
            >
              Load older changes
            </button>
          )}
        </>
      )}
    </div>
  );
}
