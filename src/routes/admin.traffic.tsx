import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/traffic")({
  component: AdminTraffic,
  head: () => pageMeta("Top pages — Admin — cdreviews.", "Top pages on the cdreviews editorial desk."),
});

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Pick dates" },
] as const;

function bounds(range: string, from: string, to: string): [string | null, string | null] {
  // Anchor to local midnight so the value (and the query key) stays stable between renders.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (range === "all") return [null, null];
  if (range === "today") return [today.toISOString(), null];
  if (range === "custom") {
    const f = from ? new Date(from + "T00:00:00").toISOString() : null;
    const t = to ? new Date(new Date(to + "T00:00:00").getTime() + 86400000).toISOString() : null;
    return [f, t];
  }
  return [new Date(today.getTime() - (Number(range) - 1) * 86400000).toISOString(), null];
}

function AdminTraffic() {
  const [range, setRange] = useState<string>("7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [f, t] = bounds(range, from, to);
  const { data, isLoading, error } = useQuery({
    queryKey: ["top-pages", f, t],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("top_pages", { _from: f as string, _to: t as string, _limit: 100 });
      if (error) throw error;
      return (data ?? []) as { path: string; views: number }[];
    },
  });
  const total = (data ?? []).reduce((s, r) => s + Number(r.views), 0);
  const max = Math.max(1, ...(data ?? []).map((r) => Number(r.views)));
  const chip = (on: boolean) =>
    `px-3 min-h-11 py-1.5 border font-mono text-[11px] uppercase tracking-[0.12em] ${on ? "bg-ink text-bone border-ink" : "border-rule text-ink-2"}`;

  return (
    <div className="space-y-6 max-w-[900px]">
      <h1 className="fr-display text-[40px]">Top pages</h1>
      <p className="text-[14px] text-mute">Page views on the public site. Admin and sign-in pages aren't counted. Counting started Oct 14, 2026.</p>
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)} className={chip(range === r.id)}>{r.label}</button>
        ))}
      </div>
      {range === "custom" && (
        <div className="flex flex-wrap gap-3 items-center text-[14px]">
          <label>From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-bone border border-rule px-2 py-1 ml-1" /></label>
          <label>To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-bone border border-rule px-2 py-1 ml-1" /></label>
        </div>
      )}
      <p className="font-mono text-[12px] text-mute">{total} views · {data?.length ?? 0} pages</p>
      {error && <p className="text-vermil">Couldn't load: {(error as Error).message}</p>}
      {isLoading ? <p className="text-mute">Loading…</p> : data && data.length === 0 ? (
        <p className="text-mute">No views in this range yet.</p>
      ) : (
        <ol className="border-t border-rule">
          {data?.map((r, i) => (
            <li key={r.path} className="border-b border-rule py-2.5 flex items-center gap-4">
              <span className="font-mono text-[11px] w-7 text-mute">{String(i + 1).padStart(2, "0")}</span>
              <a href={r.path} target="_blank" rel="noreferrer" className="flex-1 min-w-0 break-all hover:text-vermil">{r.path}</a>
              <span className="hidden sm:block w-40 h-1.5 bg-rule"><span className="block h-full bg-vermil" style={{ width: `${(Number(r.views) / max) * 100}%` }} /></span>
              <span className="font-mono text-[12px] w-12 text-right">{r.views}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
