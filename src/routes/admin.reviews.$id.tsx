import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { slug as slugify, type Review, type ReviewKind, type Decade } from "@/lib/cd-data";
import { supabase } from "@/integrations/supabase/client";
import { lookupSpotifyAlbum, searchSpotifyAlbums } from "@/lib/spotify.functions";
import { Cover } from "@/components/site/Cover";

export const Route = createFileRoute("/admin/reviews/$id")({ component: EditReview });

const ART_OPTS = ["art-1","art-2","art-3","art-4","art-5","art-6","art-7","art-8","art-hero","art-archive"];

function EditReview() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const existing = useCdStore((s) => s.reviews.find((r) => r.id === id));
  const navigate = useNavigate();

  const [r, setR] = useState<Review>(existing ?? {
    id: "", slug: "", title: "", artist: "", label: "", format: "LP · 10 tracks",
    genre: "", date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).replace(/\//g, "."),
    decade: "2020s", kind: "review", score: 7.5, art: "art-1", byline: "", readMins: 5,
    body: [""], status: "draft",
  });
  const [artBusy, setArtBusy] = useState<string | null>(null);
  const [artMsg, setArtMsg] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    albumId: string; albumName: string; artistId: string | null; artistName: string;
    releaseDate: string; totalTracks: number; spotifyUrl: string; imageUrl: string | null;
  }>>([]);

  if (!isNew && !existing) return <p className="text-bone/60">Not found.</p>;

  function save(e: FormEvent) {
    e.preventDefault();
    const newId = r.id || slugify(`${r.artist}-${r.title}`);
    const newSlug = r.slug || slugify(`${r.artist}-${r.title}`);
    cdActions.upsertReview({ ...r, id: newId, slug: newSlug });
    navigate({ to: "/admin/reviews" });
  }

  function patch<K extends keyof Review>(k: K, v: Review[K]) { setR((p) => ({ ...p, [k]: v })); }

  async function handleUpload(file: File) {
    setArtBusy("upload"); setArtMsg(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const slug = r.slug || slugify(`${r.artist}-${r.title}`) || "review";
      const path = `${slug}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("review-art").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("review-art").getPublicUrl(path);
      patch("artUrl", data.publicUrl);
      setArtMsg("✓ Uploaded");
    } catch (e) {
      setArtMsg(e instanceof Error ? e.message : "Upload failed");
    } finally { setArtBusy(null); }
  }

  async function handleSpotifyPull() {
    if (!r.artist || !r.title) { setArtMsg("Add artist and title first"); return; }
    setArtBusy("spotify"); setArtMsg(null);
    try {
      const res = await lookupSpotifyAlbum({ data: { artist: r.artist, album: r.title } });
      if (!res.ok) { setArtMsg(res.error); return; }
      setR((p) => ({
        ...p,
        artUrl: res.imageUrl ?? p.artUrl,
        spotifyUrl: res.spotifyUrl,
        spotifyAlbumId: res.albumId,
        spotifyArtistId: res.artistId ?? p.spotifyArtistId,
      }));
      setArtMsg(`✓ Matched: ${res.artistName} — ${res.albumName}`);
    } catch (e) {
      setArtMsg(e instanceof Error ? e.message : "Spotify lookup failed");
    } finally { setArtBusy(null); }
  }

  return (
    <div>
      <AdminHeader title={isNew ? "New review" : `Edit · ${r.title}`} action={
        <div className="flex gap-2">
          <AdminButton tone="ghost" onClick={() => navigate({ to: "/admin/reviews" })}>Cancel</AdminButton>
          <AdminButton type="submit" onClick={() => (document.getElementById("rf") as HTMLFormElement)?.requestSubmit()}>Save</AdminButton>
        </div>
      } />

      {/* Artwork + Spotify panel */}
      <div className="border border-bone/10 p-5 mb-8 max-w-[1100px] grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5">
        <div>
          {r.artUrl ? (
            <img src={r.artUrl} alt="cover" className="w-[180px] h-[180px] object-cover border border-bone/20" />
          ) : (
            <div className="w-[180px] h-[180px]"><Cover r={r} /></div>
          )}
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Cover artwork</div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="font-mono text-[10px] tracking-[0.25em] uppercase px-4 py-2 border bg-bone/0 text-bone/80 border-bone/20 hover:text-bone cursor-pointer">
              {artBusy === "upload" ? "Uploading…" : "↑ Upload image"}
              <input type="file" accept="image/*" className="hidden" disabled={artBusy !== null}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
            <AdminButton onClick={handleSpotifyPull}>
              {artBusy === "spotify" ? "Searching…" : "↻ Pull from Spotify"}
            </AdminButton>
            {(r.artUrl || r.spotifyUrl || r.spotifyArtistId) && (
              <AdminButton tone="ghost" onClick={() => { patch("artUrl", undefined); patch("spotifyUrl", undefined); patch("spotifyAlbumId", undefined); patch("spotifyArtistId", undefined); setArtMsg("Cleared"); }}>
                Clear
              </AdminButton>
            )}
          </div>
          {artMsg && <div className="font-mono text-[11px] text-bone/70">{artMsg}</div>}
          <Field label="Image URL">
            <input className={inputCls} value={r.artUrl ?? ""} onChange={(e) => patch("artUrl", e.target.value || undefined)} placeholder="https://…" />
          </Field>
          <Field label="Spotify album URL">
            <input className={inputCls} value={r.spotifyUrl ?? ""} onChange={(e) => {
              const v = e.target.value;
              patch("spotifyUrl", v || undefined);
              const m = v.match(/album\/([a-zA-Z0-9]+)/);
              if (m) patch("spotifyAlbumId", m[1]);
            }} placeholder="https://open.spotify.com/album/…" />
          </Field>
          <Field label="Spotify artist ID (for artist player)">
            <input className={inputCls} value={r.spotifyArtistId ?? ""} onChange={(e) => {
              const v = e.target.value.trim();
              const m = v.match(/artist\/([a-zA-Z0-9]+)/);
              patch("spotifyArtistId", (m ? m[1] : v) || undefined);
            }} placeholder="artist id or https://open.spotify.com/artist/…" />
          </Field>
        </div>
      </div>

      <form id="rf" onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1100px]">
        <Field label="Title"><input className={inputCls} value={r.title} onChange={(e) => patch("title", e.target.value)} required maxLength={120} /></Field>
        <Field label="Artist"><input className={inputCls} value={r.artist} onChange={(e) => patch("artist", e.target.value)} required maxLength={120} /></Field>
        <Field label="Label"><input className={inputCls} value={r.label} onChange={(e) => patch("label", e.target.value)} maxLength={80} /></Field>
        <Field label="Format"><input className={inputCls} value={r.format} onChange={(e) => patch("format", e.target.value)} maxLength={60} /></Field>
        <Field label="Genre"><input className={inputCls} value={r.genre} onChange={(e) => patch("genre", e.target.value)} maxLength={60} /></Field>
        <Field label="Byline"><input className={inputCls} value={r.byline} onChange={(e) => patch("byline", e.target.value)} maxLength={80} /></Field>
        <Field label="Date (MM.DD.YYYY)"><input className={inputCls} value={r.date} onChange={(e) => patch("date", e.target.value)} maxLength={10} /></Field>
        <Field label="Decade">
          <select className={inputCls} value={r.decade} onChange={(e) => patch("decade", e.target.value as Decade)}>
            {(["1990s","2000s","2010s","2020s"] as const).map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select className={inputCls} value={r.kind} onChange={(e) => patch("kind", e.target.value as ReviewKind)}>
            <option value="review">Standard review</option>
            <option value="bnm">Best New Music</option>
            <option value="bnr">Best New Reissue</option>
          </select>
        </Field>
        <Field label="Score (0–10)"><input type="number" step="0.1" min="0" max="10" className={inputCls} value={r.score} onChange={(e) => patch("score", Number(e.target.value))} /></Field>
        <Field label="Read time (minutes)"><input type="number" min="1" max="60" className={inputCls} value={r.readMins} onChange={(e) => patch("readMins", Number(e.target.value))} /></Field>
        <Field label="Sleeve art (fallback CSS art when no image)">
          <select className={inputCls} value={r.art} onChange={(e) => patch("art", e.target.value)}>
            {ART_OPTS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={r.status} onChange={(e) => patch("status", e.target.value as Review["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <div className="lg:col-span-2">
          <Field label="Pull quote (optional)">
            <input className={inputCls} value={r.pull ?? ""} onChange={(e) => patch("pull", e.target.value)} maxLength={240} />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Body (one paragraph per line, blank line between)">
            <textarea className={inputCls + " min-h-[300px]"} value={r.body.join("\n\n")} onChange={(e) => patch("body", e.target.value.split(/\n\s*\n/))} maxLength={20000} />
          </Field>
        </div>
      </form>
    </div>
  );
}
