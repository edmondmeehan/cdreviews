import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { rowToReview } from "@/lib/cd-store";
import { Cover } from "@/components/site/Cover";

export const Route = createFileRoute("/preview/$token")({
  component: PreviewPage,
  head: () => ({
    meta: [
      { title: "Draft preview — cdreviews." },
      { name: "description", content: "A private preview of an unpublished cdreviews draft." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Draft preview — cdreviews." },
      { property: "og:description", content: "A private preview of an unpublished cdreviews draft." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PreviewPage() {
  const { token } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["preview", token],
    queryFn: async () => {
      if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
      const { data, error } = await supabase.rpc("get_review_preview", { _token: token });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : null;
      return row ? rowToReview(row as Record<string, unknown>) : null;
    },
  });

  if (isLoading) return <Shell><p className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink/50">Loading preview…</p></Shell>;
  if (!data) return <Shell><h1 className="fr-display text-[48px]">Preview not found.</h1><Link to="/" className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">→ Back to site</Link></Shell>;
  const r = data;
  return (
    <Shell>
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil border border-vermil/40 px-3 py-2 inline-block">
        {r.status === "published" ? "Published" : "Draft preview · not public"}
      </div>
      <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
        <div className="w-[260px] max-w-full aspect-square">
          {r.artUrl ? <img src={r.artUrl} alt={`${r.artist} — ${r.title}`} className="w-full h-full object-cover" /> : <Cover r={r} />}
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60">{r.artist}</div>
          <h1 className="fr-display text-[48px] leading-none">{r.title}</h1>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60">{r.label} · {r.date} · By {r.byline}</div>
          <div className="fr-score-card text-[56px] text-vermil">{r.score.toFixed(1)}</div>
        </div>
      </div>
      <div className="space-y-5 max-w-[68ch]">
        {r.body.filter(Boolean).map((p, i) => <p key={i} className="fr-blurb text-[18px] leading-relaxed text-ink/85">{p}</p>)}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="bg-bone text-ink min-h-screen"><div className="max-w-[960px] mx-auto px-6 py-16 space-y-8">{children}</div></div>;
}
