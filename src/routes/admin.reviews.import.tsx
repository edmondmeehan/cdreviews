import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import * as XLSX from "xlsx";
import { AdminHeader, AdminButton, Field } from "@/components/admin/bits";
import { cdActions } from "@/lib/cd-store";
import { rowsToReviews, type ImportResult } from "@/lib/review-import";

export const Route = createFileRoute("/admin/reviews/import")({ component: ImportPage });

const EXPECTED = [
  "Artist", "Album", "Review Date", "Period", "Hot Pick", "Label",
  "Label Address", "Reviewer", "Rating", "Contact", "Review Text", "Archive URL",
];

function ImportPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setCommitted(false);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
      if (rows.length === 0) {
        setError("No rows found in the first sheet.");
        return;
      }
      setResult(rowsToReviews(rows));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file.");
    }
  }

  function commit() {
    if (!result) return;
    cdActions.bulkUpsertReviews(result.reviews);
    setCommitted(true);
  }

  return (
    <div>
      <AdminHeader
        title="Bulk import reviews"
        action={<Link to="/admin/reviews" className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/60 hover:text-bone">← Back to reviews</Link>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-7 space-y-6">
          <Field label="Excel or CSV file">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="block w-full text-bone/80 font-mono text-[12px] file:mr-4 file:py-2 file:px-4 file:border file:border-vermil file:bg-vermil file:text-bone file:font-mono file:text-[10px] file:tracking-[0.25em] file:uppercase hover:file:bg-bone hover:file:text-ink"
            />
          </Field>

          {fileName && <div className="font-mono text-[11px] text-bone/60">Loaded <span className="text-bone">{fileName}</span></div>}
          {error && <div className="font-mono text-[12px] text-vermil border border-vermil/40 p-3">{error}</div>}

          {result && (
            <div className="space-y-4">
              <div className="border border-bone/10 p-4 space-y-1 font-mono text-[12px] text-bone/80">
                <div><span className="text-acid">{result.reviews.length}</span> reviews ready to import</div>
                <div><span className="text-vermil">{result.skipped}</span> rows skipped</div>
                <div><span className="text-bone/60">{result.issues.length}</span> warnings</div>
              </div>

              {result.reviews.length > 0 && (
                <div className="border border-bone/10">
                  <table className="w-full font-mono text-[11px]">
                    <thead>
                      <tr className="text-left text-bone/50 tracking-[0.2em] uppercase text-[10px] border-b border-bone/10">
                        <th className="py-2 px-3">Artist</th><th>Album</th><th>Date</th><th>Rating</th><th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.reviews.slice(0, 50).map((r) => (
                        <tr key={r.id} className="border-b border-bone/5">
                          <td className="py-2 px-3 text-bone/80">{r.artist}</td>
                          <td className="text-bone">{r.title}</td>
                          <td className="text-bone/60">{r.date}</td>
                          <td className={r.score >= 8.5 ? "text-vermil" : "text-bone/70"}>{r.score.toFixed(1)}</td>
                          <td className="uppercase text-bone/60">{r.kind}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.reviews.length > 50 && (
                    <div className="font-mono text-[10px] text-bone/40 px-3 py-2 border-t border-bone/10">+ {result.reviews.length - 50} more</div>
                  )}
                </div>
              )}

              {result.issues.length > 0 && (
                <details className="border border-bone/10 p-3">
                  <summary className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil cursor-pointer">{result.issues.length} warnings</summary>
                  <ul className="mt-3 space-y-1 font-mono text-[11px] text-bone/70 max-h-[280px] overflow-auto">
                    {result.issues.map((iss, i) => (
                      <li key={i}>row {iss.row} · <span className="text-vermil">{iss.field}</span> · {iss.message}</li>
                    ))}
                  </ul>
                </details>
              )}

              <div className="flex items-center gap-3 pt-2">
                <AdminButton onClick={commit} tone="primary">{committed ? "Imported ✓" : `Import ${result.reviews.length} reviews`}</AdminButton>
                {committed && <Link to="/admin/reviews" className="font-mono text-[11px] text-acid hover:text-bone">→ View in reviews list</Link>}
              </div>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5 space-y-4 font-mono text-[11px] text-bone/70">
          <div className="border border-bone/10 p-4 space-y-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-vermil">Expected columns</div>
            <ul className="space-y-1">
              {EXPECTED.map((c) => <li key={c}>· {c}</li>)}
            </ul>
            <div className="pt-2 border-t border-bone/10 text-bone/50 leading-relaxed">
              Header row required. Column order doesn't matter. Headers are matched case- and space-insensitively.
              Rating accepts 0–10, 0.0–1.0, or percentages. Hot Pick of "Y/Yes/True/X" marks the row as Best New Music.
              Paragraph breaks in Review Text use blank lines.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
