import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader, AdminButton } from "@/components/admin/bits";
import { extractSampleLinks } from "@/lib/contributor-application";

export const Route = createFileRoute("/admin/applications")({
  staticData: { sitemap: false },
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

function replyHref(a: Application) {
  const subject = encodeURIComponent("Your cdreviews. application");
  const body = encodeURIComponent(`Hi ${a.name.split(" ")[0]},\n\n`);
  return `mailto:${a.email}?subject=${subject}&body=${body}`;
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
    const { error } = await supabase.from("contributor_applications").delete().eq("id", id);
    if (error) { alert(`Couldn't delete: ${error.message}`); return; }
    qc.invalidateQueries({ queryKey: ["contributor-applications"] });
  }

  return (
    <div>
      <AdminHeader title="Writer applications" />
      {isLoading && <p className="font-mono text-[11px] text-ink/50">Loading…</p>}
      {error && <p className="font-mono text-[11px] text-vermil">Couldn't load applications.</p>}
      {data && data.length === 0 && <p className="font-mono text-[11px] text-ink/50">No applications yet.</p>}
      <div className="space-y-4">
        {data?.map((a) => {
          const links = extractSampleLinks(a.samples);
          return (
            <article key={a.id} className="border border-ink/10 p-4 sm:p-5 space-y-3 min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="min-w-0">
                  <span className="fr-card-title text-[20px] sm:text-[22px] text-ink break-words">{a.name}</span>
                  <a href={`mailto:${a.email}`} className="block sm:inline sm:ml-3 font-mono text-[12px] text-vermil hover:underline break-all">{a.email}</a>
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50">
                  {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="space-y-1">
                {links.map((u) => (
                  <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block font-mono text-[12px] text-vermil hover:underline break-all py-1">{u}</a>
                ))}
                {(links.length === 0 || a.samples.trim().split(/\s+/).length > links.length) && (
                  <p className="font-mono text-[12px] text-ink/70 whitespace-pre-wrap break-words">{a.samples}</p>
                )}
              </div>
              {a.note && <p className="text-[14px] text-ink/70 whitespace-pre-wrap break-words">{a.note}</p>}
              <div className="pt-1 flex flex-wrap gap-2">
                <a href={replyHref(a)} className="inline-flex items-center min-h-10 px-3 border border-ink/20 font-mono text-[11px] tracking-[0.15em] uppercase text-ink hover:border-vermil hover:text-vermil">Reply by email</a>
                <AdminButton tone="danger" onClick={() => remove(a.id, a.name)}>Delete</AdminButton>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
