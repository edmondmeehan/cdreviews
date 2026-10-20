import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ActivityRow = {
  id: number;
  at: string;
  actor_email: string | null;
  action: "created" | "updated" | "deleted";
  entity: string;
  record_id: string | null;
  label: string | null;
  changed: string[] | null;
};

/** Friendly names for the tables the change log watches. */
export const ENTITY_LABELS: Record<string, string> = {
  reviews: "Review",
  features: "Feature",
  lists: "List",
  contributors: "Contributor",
  ads: "Ad",
  featured_slots: "Homepage feature",
  site_settings: "Site settings",
  radio_settings: "Radio settings",
  user_roles: "Role",
};

const FIELD_LABELS: Record<string, string> = {
  art_url: "cover",
  body: "review text",
  status: "status",
  score: "score",
  title: "title",
  artist: "artist",
  spotify_url: "Spotify link",
  spotify_album_id: "Spotify album",
  spotify_artist_id: "Spotify artist",
  youtube_url: "YouTube link",
  publish_at: "scheduled date",
  submitted_at: "submission",
  preview_token: "preview link",
  maintenance_mode: "maintenance mode",
  maintenance_message: "maintenance message",
  playlist_url: "playlist",
  code_snippet: "ad code",
  read_mins: "read time",
};

function fieldList(changed: string[] | null) {
  if (!changed?.length) return null;
  const names = changed.map((f) => FIELD_LABELS[f] ?? f.replace(/_/g, " "));
  return names.length > 4 ? `${names.slice(0, 4).join(", ")} +${names.length - 4} more` : names.join(", ");
}

export function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString([], { dateStyle: "medium" });
}

// activity_log isn't in the generated Supabase types yet.
const db = supabase as unknown as SupabaseClient;

export function useActivity(opts: { limit: number; entity?: string; actor?: string }) {
  return useQuery({
    queryKey: ["admin", "activity", opts],
    queryFn: async (): Promise<ActivityRow[]> => {
      let q = db.from("activity_log").select("*").order("at", { ascending: false }).limit(opts.limit);
      if (opts.entity) q = q.eq("entity", opts.entity);
      if (opts.actor) q = q.eq("actor_email", opts.actor);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data ?? []) as ActivityRow[];
    },
    refetchInterval: 60_000,
  });
}

const ACTION_COLOR: Record<ActivityRow["action"], string> = {
  created: "text-acid",
  updated: "text-ink/80",
  deleted: "text-vermil",
};

export function ActivityList({ rows }: { rows: ActivityRow[] }) {
  if (rows.length === 0) {
    return <p className="font-mono text-[11px] text-ink/50 py-6">No changes recorded yet.</p>;
  }
  return (
    <ol className="border-t border-ink/10">
      {rows.map((r) => {
        const fields = r.action === "updated" ? fieldList(r.changed) : null;
        const label = r.label && r.label !== r.entity ? r.label : null;
        const linkable = r.entity === "reviews" && r.action !== "deleted" && r.record_id;
        return (
          <li key={r.id} className="border-b border-ink/5 py-3 grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr_auto] gap-x-4 gap-y-1 font-mono text-[11px]">
            <span className="text-ink/50" title={new Date(r.at).toLocaleString()}>{timeAgo(r.at)}</span>
            <span className="min-w-0">
              <span className="text-ink">{r.actor_email ?? "System"}</span>{" "}
              <span className={ACTION_COLOR[r.action]}>{r.action}</span>{" "}
              <span className="text-ink/60">{(ENTITY_LABELS[r.entity] ?? r.entity).toLowerCase()}</span>
              {label && (
                <>
                  {" "}
                  {linkable ? (
                    <Link to="/admin/reviews/$id" params={{ id: r.record_id! }} className="text-ink hover:text-vermil">{label}</Link>
                  ) : (
                    <span className="text-ink">{label}</span>
                  )}
                </>
              )}
              {fields && <span className="block text-ink/50 mt-0.5">Changed: {fields}</span>}
            </span>
            <span className="hidden sm:block text-ink/40 text-right whitespace-nowrap">
              {new Date(r.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Compact "Recent changes" block for the admin overview. */
export function RecentChanges() {
  const q = useActivity({ limit: 8 });
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink/50">Recent changes</h2>
        <Link to="/admin/activity" className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermil hover:underline">View all →</Link>
      </div>
      {q.isLoading ? (
        <p className="font-mono text-[11px] text-ink/50">Loading…</p>
      ) : q.error ? (
        <p className="font-mono text-[11px] text-vermil">{(q.error as Error).message}</p>
      ) : (
        <ActivityList rows={q.data ?? []} />
      )}
    </section>
  );
}
