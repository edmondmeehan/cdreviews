import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader, AdminButton } from "@/components/admin/bits";

export const Route = createFileRoute("/admin/applications")({
  head: () => pageMeta("Writer applications — Admin — cdreviews.", "People who want to write for cdreviews."),
  component: ApplicationsAdmin,
});

type Application = {
  id: string;
  name: string;
  email: string;
  samples: string;
  note: string | null;
  created_at: string;
};

function linkify(samples: string): string[] {
  return samples.split(/\s+/).filter((s) => /^https?:\/\//i.test(s));
}

function ApplicationsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["contributor-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contributor_applications")
        .select("id,name,email,samples,note,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Application[];
    },
  });

  async function remove(id: string, name: string) {
    if (!confirm(`Delete the application from ${name}?`)) return;
    await supabase.from("contributor_applications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["contributor-applications"] });
  }

  return (
    <div>
      <AdminHeader title="Writer applications" />
      {isLoading && <p className="font-mono text-[11px] text-ink/50">Loading…</p>}
      {error && <p className="font-mono text-[11px] text-vermil">Couldn't load applications.</p>}
      {data && data.length === 0 && <p className="font-mono text-[11px] text-ink/50">No applications yet.</p>}
      <div className="space-y-4">
        {data?.map((a) => (
          <article key={a.id} className="border border-ink/10 p-5 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="fr-card-title text-[22px] text-ink">{a.name}</span>
                <a href={`mailto:${a.email}`} className="ml-3 font-mono text-[11px] text-vermil hover:underline">{a.email}</a>
              </div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50">
                {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="space-y-1">
              {linkify(a.samples).length > 0 ? (
                linkify(a.samples).map((u) => (
                  <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block font-mono text-[12px] text-vermil hover:underline break-all">{u}</a>
                ))
              ) : (
                <p className="font-mono text-[12px] text-ink/70 whitespace-pre-wrap">{a.samples}</p>
              )}
            </div>
            {a.note && <p className="text-[13px] text-ink/70 whitespace-pre-wrap">{a.note}</p>}
            <div className="pt-1">
              <AdminButton tone="danger" onClick={() => remove(a.id, a.name)}>Delete</AdminButton>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
