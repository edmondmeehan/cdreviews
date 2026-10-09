import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { slug as slugify, type Feature } from "@/lib/cd-data";

export const Route = createFileRoute("/admin/features")({ component: FeaturesAdmin });

function blankFeature(): Feature {
  return { id: "", slug: "", title: "", dek: "", byline: "", date: "01.01.2026", readMins: 6, art: "art-hero", body: [""], status: "draft" };
}

function FeaturesAdmin() {
  const features = useCdStore((s) => s.features);
  const [editing, setEditing] = useState<Feature | null>(null);

  function save() {
    if (!editing) return;
    const id = editing.id || slugify(editing.title);
    cdActions.upsertFeature({ ...editing, id, slug: id });
    setEditing(null);
  }

  return (
    <div>
      <AdminHeader title="Features" action={<AdminButton onClick={() => setEditing(blankFeature())}>+ New feature</AdminButton>} />
      <div className="space-y-2">
        {features.map((f) => (
          <div key={f.id} className="flex items-center justify-between border-b border-ink/10 py-3">
            <div>
              <div className="font-mono text-[12px] text-ink">{f.title}</div>
              <div className="font-mono text-[10px] text-ink/50">{f.byline} · {f.date} · {f.status}</div>
            </div>
            <div className="flex gap-2">
              <AdminButton tone="ghost" onClick={() => setEditing(f)}>Edit</AdminButton>
              <AdminButton tone="danger" onClick={() => { if (confirm(`Delete "${f.title}"?`)) cdActions.deleteFeature(f.id); }}>Delete</AdminButton>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-bone/90 z-50 overflow-auto p-6 flex items-start justify-center">
          <div className="bg-bone border border-ink/20 max-w-[800px] w-full p-8 space-y-5">
            <h2 className="fr-display text-[32px] text-ink">{editing.id ? "Edit" : "New"} feature</h2>
            <Field label="Title"><input className={inputCls} maxLength={140} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Dek"><input className={inputCls} maxLength={240} value={editing.dek} onChange={(e) => setEditing({ ...editing, dek: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Byline"><input className={inputCls} maxLength={80} value={editing.byline} onChange={(e) => setEditing({ ...editing, byline: e.target.value })} /></Field>
              <Field label="Date"><input className={inputCls} maxLength={10} value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></Field>
              <Field label="Read mins"><input type="number" className={inputCls} value={editing.readMins} onChange={(e) => setEditing({ ...editing, readMins: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Status">
              <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Feature["status"] })}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </Field>
            <Field label="Body (paragraphs separated by blank lines)">
              <textarea className={inputCls + " min-h-[260px]"} maxLength={20000} value={editing.body.join("\n\n")} onChange={(e) => setEditing({ ...editing, body: e.target.value.split(/\n\s*\n/) })} />
            </Field>
            <div className="flex justify-end gap-2">
              <AdminButton tone="ghost" onClick={() => setEditing(null)}>Cancel</AdminButton>
              <AdminButton onClick={save}>Save</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
