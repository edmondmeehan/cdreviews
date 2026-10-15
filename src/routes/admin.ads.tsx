import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { AD_PLACEMENTS, clickRate, isRunning, type AdPlacement } from "@/lib/ad-pick";

export const Route = createFileRoute("/admin/ads")({ head: () => pageMeta("Ads — Admin — cdreviews.", "Ads on the cdreviews editorial desk."), component: AdsAdmin });

type Ad = {
  id: string; name: string; advertiser: string; placement: string; headline: string; body: string; cta: string;
  image_url: string | null; link_url: string; active: boolean; weight: number; starts_at: string | null; ends_at: string | null;
  code_snippet: string | null;
};
const blank = (): Omit<Ad, "id"> => ({
  name: "", advertiser: "", placement: "home_break", headline: "", body: "", cta: "Learn more",
  image_url: null, link_url: "https://", active: true, weight: 1, starts_at: null, ends_at: null, code_snippet: null,
});
const toLocal = (s: string | null) => (s ? new Date(s).toISOString().slice(0, 16) : "");
const fromLocal = (s: string) => (s ? new Date(s).toISOString() : null);

function AdsAdmin() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<Record<string, { views: number; clicks: number }>>({});
  const [edit, setEdit] = useState<(Omit<Ad, "id"> & { id?: string }) | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [{ data }, { data: s }] = await Promise.all([
      supabase.from("ads").select("*").order("created_at", { ascending: false }),
      supabase.rpc("ad_stats"),
    ]);
    setAds((data ?? []) as Ad[]);
    setStats(Object.fromEntries((s ?? []).map((r: { ad_id: string; views: number; clicks: number }) => [r.ad_id, { views: Number(r.views), clicks: Number(r.clicks) }])));
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    if (!edit) return;
    setErr(null);
    const { id, ...row } = edit;
    const { error } = id ? await supabase.from("ads").update(row).eq("id", id) : await supabase.from("ads").insert(row);
    if (error) { setErr(error.message.includes("link_url") ? "Link must start with http:// or https://" : error.message); return; }
    setEdit(null); void load();
  }
  async function upload(file: File) {
    const path = `ads/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "")}`;
    const { error } = await supabase.storage.from("review-art").upload(path, file, { contentType: file.type });
    if (error) { setErr(error.message); return; }
    const { data } = supabase.storage.from("review-art").getPublicUrl(path);
    setEdit((e) => e && { ...e, image_url: data.publicUrl });
  }
  async function toggle(a: Ad) { await supabase.from("ads").update({ active: !a.active }).eq("id", a.id); void load(); }
  async function remove(a: Ad) { if (confirm(`Delete "${a.name}"?`)) { await supabase.from("ads").delete().eq("id", a.id); void load(); } }

  const placementLabel = (p: string) => AD_PLACEMENTS.find((x) => x.key === p)?.label ?? p;

  return (
    <div>
      <AdminHeader title="Ads" action={<AdminButton onClick={() => setEdit(blank())}>New ad</AdminButton>} />

      {edit && (
        <div className="border border-ink/15 p-6 mb-10 grid md:grid-cols-2 gap-5">
          <Field label="Internal name"><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
          <Field label="Advertiser"><input className={inputCls} value={edit.advertiser} onChange={(e) => setEdit({ ...edit, advertiser: e.target.value })} /></Field>
          <Field label="Spot">
            <select className={inputCls} value={edit.placement} onChange={(e) => setEdit({ ...edit, placement: e.target.value as AdPlacement })}>
              {AD_PLACEMENTS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <span className="block font-mono text-[10px] text-ink/50">{AD_PLACEMENTS.find((p) => p.key === edit.placement)?.hint}</span>
          </Field>
          <Field label="Link (where the ad goes)"><input className={inputCls} value={edit.link_url} onChange={(e) => setEdit({ ...edit, link_url: e.target.value })} /></Field>
          <Field label="Headline"><input className={inputCls} value={edit.headline} onChange={(e) => setEdit({ ...edit, headline: e.target.value })} /></Field>
          <Field label="Button text"><input className={inputCls} value={edit.cta} onChange={(e) => setEdit({ ...edit, cta: e.target.value })} /></Field>
          <div className="md:col-span-2"><Field label="Short description"><textarea rows={2} className={inputCls} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} /></Field></div>
          <div className="md:col-span-2">
            <Field label="Ad code (optional — Google AdSense, etc.)">
              <textarea rows={4} className={inputCls} placeholder='<script async src="..."></script>…' value={edit.code_snippet ?? ""} onChange={(e) => setEdit({ ...edit, code_snippet: e.target.value || null })} />
              <span className="block font-mono text-[10px] text-ink/50">Paste the full embed code from your ad network. When set, it replaces the headline/image card above. Only paste code from networks you trust.</span>
            </Field>
          </div>
          <Field label="Image">
            <input type="file" accept="image/*" className="w-full min-w-0 font-mono text-[16px] sm:text-[11px]" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {edit.image_url && <img src={edit.image_url} alt="" className="mt-2 max-h-32" />}
          </Field>
          <Field label="Rotation weight (higher = shown more often)"><input type="number" min={1} max={100} className={inputCls} value={edit.weight} onChange={(e) => setEdit({ ...edit, weight: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })} /></Field>
          <Field label="Starts (optional)"><input type="datetime-local" className={inputCls} value={toLocal(edit.starts_at)} onChange={(e) => setEdit({ ...edit, starts_at: fromLocal(e.target.value) })} /></Field>
          <Field label="Ends (optional)"><input type="datetime-local" className={inputCls} value={toLocal(edit.ends_at)} onChange={(e) => setEdit({ ...edit, ends_at: fromLocal(e.target.value) })} /></Field>
          <label className="flex items-center gap-2 font-mono text-[11px]"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active</label>
          <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
            <AdminButton onClick={save}>Save ad</AdminButton>
            <AdminButton tone="ghost" onClick={() => setEdit(null)}>Cancel</AdminButton>
            {err && <span className="font-mono text-[11px] text-vermil">{err}</span>}
          </div>
        </div>
      )}

      {ads.length === 0 ? (
        <p className="font-mono text-[11px] text-ink/50">No ads yet. Empty spots stay hidden on the site.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="mobile-ad-table w-full font-mono text-[11px] sm:min-w-[760px]">
            <thead>
              <tr className="text-left text-ink/50 tracking-[0.2em] uppercase text-[10px] border-b border-ink/10">
                <th className="py-3">Ad</th><th>Spot</th><th>Status</th><th>Views</th><th>Clicks</th><th>Rate</th><th></th>
              </tr>
            </thead>
            <tbody>
              {ads.map((a) => {
                const s = stats[a.id] ?? { views: 0, clicks: 0 };
                const status = isRunning(a) ? "Running" : !a.active ? "Paused" : a.starts_at && new Date(a.starts_at) > new Date() ? "Scheduled" : "Ended";
                return (
                  <tr key={a.id} className="border-b border-ink/5">
                    <td className="py-3 text-ink">{a.name || a.headline}<div className="text-ink/50">{a.advertiser}</div></td>
                    <td data-label="Spot" className="text-ink/70">{placementLabel(a.placement)}</td>
                    <td data-label="Status" className={status === "Running" ? "text-vermil" : "text-ink/50"}>{status}</td>
                    <td data-label="Views">{s.views}</td><td data-label="Clicks">{s.clicks}</td><td data-label="Rate">{clickRate(s.views, s.clicks)}</td>
                    <td className="text-right space-x-2 whitespace-nowrap">
                      <AdminButton tone="ghost" onClick={() => setEdit({ ...a })}>Edit</AdminButton>
                      <AdminButton tone="ghost" onClick={() => toggle(a)}>{a.active ? "Pause" : "Resume"}</AdminButton>
                      <AdminButton tone="danger" onClick={() => remove(a)}>Delete</AdminButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
