// Bulk-import mapper: turn an arbitrary spreadsheet row (CSV/XLSX) into a
// canonical Review. Header matching is case- and space-insensitive.

import { slug as slugify, type Review, type Decade, type ReviewKind } from "./cd-data";

export type RawRow = Record<string, unknown>;

export type ImportIssue = { row: number; field: string; message: string };
export type ImportResult = {
  reviews: Review[];
  issues: ImportIssue[];
  skipped: number;
};

const ART_POOL = ["art-1", "art-2", "art-3", "art-4", "art-5", "art-6", "art-7", "art-8", "art-archive"];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const FIELD_ALIASES: Record<string, string[]> = {
  artist: ["artist"],
  album: ["album", "title", "record"],
  reviewDate: ["reviewdate", "date"],
  period: ["period", "era"],
  hotPick: ["hotpick", "bestnew", "pick"],
  label: ["label"],
  labelAddress: ["labeladdress", "address"],
  reviewer: ["reviewer", "byline", "writer", "author"],
  rating: ["rating", "score"],
  contact: ["contact", "email"],
  reviewText: ["reviewtext", "review", "body", "text"],
  archiveUrl: ["archiveurl", "url", "link"],
};

function pick(row: RawRow, key: keyof typeof FIELD_ALIASES): string {
  const aliases = FIELD_ALIASES[key];
  for (const k of Object.keys(row)) {
    if (aliases.includes(norm(k))) {
      const v = row[k];
      if (v == null) return "";
      return String(v).trim();
    }
  }
  return "";
}

function toMMDDYYYY(raw: string): string | null {
  if (!raw) return null;
  // Excel serial number
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    if (n > 20000 && n < 80000) {
      const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000);
      return fmt(d);
    }
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return fmt(d);
  return null;
}
function fmt(d: Date) {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}.${dd}.${d.getUTCFullYear()}`;
}
function decadeOf(date: string): Decade {
  const y = Number(date.slice(-4));
  if (y < 2000) return "1990s";
  if (y < 2010) return "2000s";
  if (y < 2020) return "2010s";
  return "2020s";
}
function parseRating(raw: string): number | null {
  if (!raw) return null;
  const m = raw.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  let n = Number(m[0]);
  if (n <= 1 && n > 0) n = n * 10; // 0.87 → 8.7
  if (n > 10 && n <= 100) n = n / 10; // 87 → 8.7
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}
function parseHotPick(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  return ["y", "yes", "true", "1", "x", "✓", "hot"].includes(v);
}

export function rowsToReviews(rows: RawRow[]): ImportResult {
  const issues: ImportIssue[] = [];
  const reviews: Review[] = [];
  let skipped = 0;

  rows.forEach((row, i) => {
    const idx = i + 2; // assume header row = 1
    const artist = pick(row, "artist");
    const album = pick(row, "album");
    if (!artist || !album) {
      skipped++;
      issues.push({ row: idx, field: "artist/album", message: "Missing artist or album — row skipped" });
      return;
    }

    const rawDate = pick(row, "reviewDate");
    const date = toMMDDYYYY(rawDate) ?? fmt(new Date());
    if (!toMMDDYYYY(rawDate)) issues.push({ row: idx, field: "reviewDate", message: `Could not parse "${rawDate}", used today` });

    const ratingRaw = pick(row, "rating");
    const score = parseRating(ratingRaw);
    if (score == null) {
      skipped++;
      issues.push({ row: idx, field: "rating", message: `Invalid rating "${ratingRaw}" — row skipped` });
      return;
    }

    const hotPick = parseHotPick(pick(row, "hotPick"));
    const kind: ReviewKind = hotPick ? "bnm" : "review";
    const body = pick(row, "reviewText").split(/\n\s*\n|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);
    if (body.length === 0) body.push("(No review text imported.)");

    const id = slugify(`${artist}-${album}`);
    const review: Review = {
      id,
      slug: id,
      title: album,
      artist,
      label: pick(row, "label") || "—",
      format: "LP",
      genre: pick(row, "period") || "Uncategorized",
      date,
      decade: decadeOf(date),
      kind,
      score,
      art: ART_POOL[i % ART_POOL.length],
      byline: pick(row, "reviewer") || "Staff",
      readMins: Math.max(2, Math.round(body.join(" ").split(/\s+/).length / 220)),
      body,
      status: "published",
      labelAddress: pick(row, "labelAddress") || undefined,
      contact: pick(row, "contact") || undefined,
      archiveUrl: pick(row, "archiveUrl") || undefined,
      period: pick(row, "period") || undefined,
    };
    reviews.push(review);
  });

  return { reviews, issues, skipped };
}
