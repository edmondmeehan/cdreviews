import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { slug as slugify, type Review, type ReviewKind, type Decade } from "@/lib/cd-data";

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

  if (!isNew && !existing) return <p className="text-bone/60">Not found.</p>;

  function save(e: FormEvent) {
    e.preventDefault();
    const id = r.id || slugify(`${r.artist}-${r.title}`);
    cdActions.upsertReview({ ...r, id, slug: id });
    navigate({ to: "/admin/reviews" });
  }

  function patch<K extends keyof Review>(k: K, v: Review[K]) { setR((p) => ({ ...p, [k]: v })); }

  return (
    <div>
      <AdminHeader title={isNew ? "New review" : `Edit · ${r.title}`} action={
        <div className="flex gap-2">
          <AdminButton tone="ghost" onClick={() => navigate({ to: "/admin/reviews" })}>Cancel</AdminButton>
          <AdminButton type="submit" onClick={() => (document.getElementById("rf") as HTMLFormElement)?.requestSubmit()}>Save</AdminButton>
        </div>
      } />
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
        <Field label="Sleeve art">
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
        <div className="lg:col-span-2">
          <div className={`art ${r.art} max-w-[200px]`} />
        </div>
      </form>
    </div>
  );
}
