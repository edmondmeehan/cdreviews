import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Row = { path: string; views: number };
const DAY = 86400000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function useViews(from: string, to: string | null) {
  return useQuery({
    queryKey: ["desk-metrics", from, to],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("top_pages", { _from: from, _to: to as string, _limit: 1000 });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

const sum = (rows?: Row[]) => (rows ?? []).reduce((s, r) => s + Number(r.views), 0);

/** Key traffic numbers for the editorial desk, from the site's own page-view counter. */
export function DeskMetrics() {
  const today = startOfToday();
  const iso = (t: number) => new Date(t).toISOString();
  const todayQ = useViews(iso(today), null);
  const weekQ = useViews(iso(today - 6 * DAY), null);
  const prevQ = useViews(iso(today - 13 * DAY), iso(today - 6 * DAY));
  const monthQ = useViews(iso(today - 29 * DAY), null);

  const week = sum(weekQ.data);
  const prev = sum(prevQ.data);
  const change = prev > 0 ? Math.round(((week - prev) / prev) * 100) : null;
  const reviews = (weekQ.data ?? []).filter((r) => r.path.startsWith("/reviews/")).slice(0, 5);
  const loading = todayQ.isLoading || weekQ.isLoading || monthQ.isLoading;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">Traffic</h2>
        <Link to="/admin/traffic" className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/70 hover:text-vermil">All pages →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
        <Metric label="Views today" value={loading ? "…" : sum(todayQ.data)} />
        <Metric label="Last 7 days" value={loading ? "…" : week}
          note={change === null ? undefined : `${change >= 0 ? "+" : ""}${change}% vs previous week`} />
        <Metric label="Last 30 days" value={loading ? "…" : sum(monthQ.data)} />
        <Metric label="Pages read (7d)" value={loading ? "…" : (weekQ.data ?? []).length} />
      </div>
      <div>
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/50 mb-2">Most-read reviews · 7 days</div>
        {reviews.length === 0 ? (
          <p className="font-mono text-[11px] text-ink/50">{loading ? "Loading…" : "No review reads yet this week."}</p>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {reviews.map((r) => (
              <li key={r.path} className="py-2 flex items-center justify-between gap-3 font-mono text-[11px]">
                <a href={r.path} target="_blank" rel="noreferrer" className="text-ink hover:text-vermil truncate">{r.path.replace("/reviews/", "").replace(/-/g, " ")}</a>
                <span className="shrink-0 text-ink/60">{Number(r.views)} views</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="bg-bone min-w-0 p-4 sm:p-6">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/50">{label}</div>
      <div className="fr-score-card text-[36px] sm:text-[44px] text-ink mt-2">{value}</div>
      {note && <div className="font-mono text-[10px] text-ink/60 mt-1">{note}</div>}
    </div>
  );
}
