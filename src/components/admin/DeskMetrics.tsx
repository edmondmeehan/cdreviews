import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminButton } from "@/components/admin/bits";
import { trafficBounds, totalViews, weeklyChange, type TrafficRow } from "@/lib/desk-metrics";

function useViews(from: string, to: string | null) {
  return useQuery({
    queryKey: ["desk-metrics", from, to],
    staleTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("top_pages", { _from: from, _to: to as string, _limit: 1000 });
      if (error) throw error;
      return (data ?? []) as TrafficRow[];
    },
  });
}

/** Key traffic numbers for the editorial desk, from the site's own page-view counter. */
export function DeskMetrics() {
  const bounds = trafficBounds();
  const todayQ = useViews(bounds.today, null);
  const weekQ = useViews(bounds.week, null);
  const prevQ = useViews(bounds.previousWeek, bounds.week);
  const monthQ = useViews(bounds.month, null);

  const week = totalViews(weekQ.data);
  const change = weekQ.isSuccess && prevQ.isSuccess ? weeklyChange(week, totalViews(prevQ.data)) : null;
  const reviews = (weekQ.data ?? []).filter((r) => r.path.startsWith("/reviews/")).slice(0, 5);
  const queries = [todayQ, weekQ, prevQ, monthQ];
  const failed = queries.filter((query) => query.isError);
  const value = (query: typeof todayQ, count: number) => query.isPending ? "…" : query.isError ? "—" : count.toLocaleString("en-US");

  return (
    <section aria-label="Traffic" className="min-w-0 space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">Traffic</h2>
        <Link to="/admin/traffic" className="inline-flex shrink-0 items-center font-mono text-[10px] tracking-[0.25em] uppercase text-ink/70 hover:text-vermil">All pages →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
        <Metric label="Views today" value={value(todayQ, totalViews(todayQ.data))} />
        <Metric label="Last 7 days" value={value(weekQ, week)}
          note={change === null ? undefined : `${change >= 0 ? "+" : ""}${change}% vs previous week`} />
        <Metric label="Last 30 days" value={value(monthQ, totalViews(monthQ.data))} />
        <Metric label="Pages read (7d)" value={value(weekQ, (weekQ.data ?? []).length)} />
      </div>
      {failed.length > 0 && (
        <div role="alert" className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <p className="min-w-0 text-[12px] text-vermil">Some traffic figures couldn’t load. Please try again.</p>
          <AdminButton tone="ghost" disabled={queries.some((query) => query.isFetching)} onClick={() => { failed.forEach((query) => { void query.refetch(); }); }}>Retry</AdminButton>
        </div>
      )}
      <div>
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/50 mb-2">Most-read reviews · 7 days</div>
        {reviews.length === 0 ? (
          <p className="font-mono text-[11px] text-ink/50">{weekQ.isPending ? "Loading…" : weekQ.isError ? "Review traffic is unavailable." : "No review reads yet this week."}</p>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {reviews.map((r) => (
              <li key={r.path} className="py-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 font-mono text-[11px]">
                <a href={r.path} target="_blank" rel="noreferrer" className="min-w-0 inline-flex items-center break-words [overflow-wrap:anywhere] text-ink hover:text-vermil">{r.path.replace("/reviews/", "").replace(/-/g, " ")}</a>
                <span className="shrink-0 text-ink/60 tabular-nums">{Number(r.views).toLocaleString("en-US")} views</span>
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
      <div className="fr-score-card text-[36px] sm:text-[44px] text-ink mt-2 min-h-10 tabular-nums [overflow-wrap:anywhere] tracking-normal">{value}</div>
      {note && <div className="font-mono text-[10px] text-ink/60 mt-1 break-words">{note}</div>}
    </div>
  );
}
