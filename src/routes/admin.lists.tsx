import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { slug as slugify, type CdList } from "@/lib/cd-data";

export const Route = createFileRoute("/admin/lists")({ component: ListsAdmin });

function blank(): CdList {
  return { id: "", slug: "", title: "", dek: "", byline: "", date: "01.01.2026", art: "art-1", items: [{ rank: 1, title: "", artist: "" }], status: "draft" };
}

function ListsAdmin() {
  const lists = useCdStore((s) => s.lists);
  const [e, setE] = useState<CdList | null>(null);

  function save() {
    if (!e) return;
    const id = e.id || slugify(e.title);
    cdActions.upsertList({ ...e, id, slug: id });
    setE(null);
  }

  return (
    <div>
      <AdminHeader title="Lists" action={<AdminButton onClick={() => setE(blank())}>+ New list</AdminButton>} />
      <div className="space-y-2">
        {lists.map((l) => (
          <div key={l.id} className="flex items-center justify-between border-b border-ink/10 py-3">
            <div>
              <div className="font-mono text-[12px] text-ink">{l.title}</div>
              <div className="font-mono text-[10px] text-ink/50">{l.items.length} entries · {l.status}</div>
            </div>
            <div className="flex gap-2">
              <AdminButton tone="ghost" onClick={() => setE(l)}>Edit</AdminButton>
              <AdminButton tone="danger" onClick={() => { if (confirm(`Delete "${l.title}"?`)) cdActions.deleteList(l.id); }}>Delete</AdminButton>
            </div>
          </div>
        ))}
      </div>

      {e && (
        <div className="fixed inset-0 bg-bone/90 z-50 overflow-auto p-6 flex items-start justify-center">
          <div className="bg-bone border border-ink/20 max-w-[800px] w-full p-8 space-y-5">
            <h2 className="fr-display text-[32px] text-ink">{e.id ? "Edit" : "New"} list</h2>
            <Field label="Title"><input className={inputCls} maxLength={140} value={e.title} onChange={(ev) => setE({ ...e, title: ev.target.value })} /></Field>
            <Field label="Dek"><input className={inputCls} maxLength={240} value={e.dek} onChange={(ev) => setE({ ...e, dek: ev.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Byline"><input className={inputCls} maxLength={80} value={e.byline} onChange={(ev) => setE({ ...e, byline: ev.target.value })} /></Field>
              <Field label="Date"><input className={inputCls} maxLength={10} value={e.date} onChange={(ev) => setE({ ...e, date: ev.target.value })} /></Field>
            </div>
            <Field label="Status">
              <select className={inputCls} value={e.status} onChange={(ev) => setE({ ...e, status: ev.target.value as CdList["status"] })}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </Field>

            <div className="space-y-2">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Entries</div>
              {e.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input type="number" className={inputCls + " col-span-2"} value={it.rank} onChange={(ev) => {
                    const items = [...e.items]; items[idx] = { ...it, rank: Number(ev.target.value) }; setE({ ...e, items });
                  }} />
                  <input placeholder="Title" className={inputCls + " col-span-4"} maxLength={120} value={it.title} onChange={(ev) => {
                    const items = [...e.items]; items[idx] = { ...it, title: ev.target.value }; setE({ ...e, items });
                  }} />
                  <input placeholder="Artist" className={inputCls + " col-span-4"} maxLength={120} value={it.artist} onChange={(ev) => {
                    const items = [...e.items]; items[idx] = { ...it, artist: ev.target.value }; setE({ ...e, items });
                  }} />
                  <button type="button" className="col-span-2 font-mono text-[10px] uppercase text-vermil" onClick={() => {
                    setE({ ...e, items: e.items.filter((_, i) => i !== idx) });
                  }}>Remove</button>
                </div>
              ))}
              <AdminButton tone="ghost" onClick={() => setE({ ...e, items: [...e.items, { rank: e.items.length + 1, title: "", artist: "" }] })}>+ Add entry</AdminButton>
            </div>

            <div className="flex justify-end gap-2">
              <AdminButton tone="ghost" onClick={() => setE(null)}>Cancel</AdminButton>
              <AdminButton onClick={save}>Save</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
