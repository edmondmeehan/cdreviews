import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { radioQueryKey, spotifyPlaylistId, useRadioSettings } from "@/lib/radio-settings";

export const Route = createFileRoute("/admin/radio")({
  component: AdminRadio,
  head: () => pageMeta("Radio playlist — Admin — cdreviews.", "Radio playlist on the cdreviews editorial desk."),
});

function AdminRadio() {
  const { data } = useRadioSettings();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDescription(data.description);
      setUrl(data.playlist_url);
    }
  }, [data]);

  const id = spotifyPlaylistId(url);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return setMsg("That doesn't look like a Spotify playlist link.");
    setSaving(true);
    const { error } = await supabase
      .from("radio_settings")
      .update({ title: title.trim(), description: description.trim(), playlist_url: url.trim(), updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    if (error) return setMsg(`Couldn't save: ${error.message}`);
    await qc.invalidateQueries({ queryKey: radioQueryKey });
    setMsg("Saved — the Radio page now shows this playlist.");
  }

  const field = "w-full bg-bone border border-rule px-3 py-2.5 text-ink";
  return (
    <div className="space-y-6 max-w-[760px]">
      <h1 className="fr-display text-[40px]">Radio playlist</h1>
      <form onSubmit={save} className="space-y-5">
        <label className="block space-y-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Playlist name</span>
          <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </label>
        <label className="block space-y-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Description</span>
          <textarea className={field} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
        </label>
        <label className="block space-y-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Spotify playlist link</span>
          <input className={field} value={url} onChange={(e) => setUrl(e.target.value)} required />
          <span className="text-[13px] text-mute">In Spotify: Share → Copy link to playlist, then paste here.</span>
        </label>
        <button disabled={saving} className="bg-ink text-bone px-5 py-3 font-mono text-[12px] uppercase tracking-[0.12em] disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <p className="text-[14px] text-ink-2">{msg}</p>}
      </form>
      {id && (
        <iframe
          title="Playlist preview"
          src={`https://open.spotify.com/embed/playlist/${id}?theme=0`}
          width="100%"
          height="352"
          frameBorder={0}
          allow="encrypted-media"
          className="rounded-xl"
        />
      )}
    </div>
  );
}
