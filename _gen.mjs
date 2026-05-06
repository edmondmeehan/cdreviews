import * as X from 'xlsx';
import { writeFileSync } from 'fs';

const wb = X.readFile('/tmp/listone.xlsx');
const rows = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });

const ART_POOL = ["art-1","art-2","art-3","art-4","art-5","art-6","art-7","art-8","art-archive"];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

function fmt(d){ const mm=String(d.getUTCMonth()+1).padStart(2,'0'); const dd=String(d.getUTCDate()).padStart(2,'0'); return `${mm}.${dd}.${d.getUTCFullYear()}`; }
function parseDate(raw){ if(!raw) return null; if(/^\d+(\.\d+)?$/.test(raw)){ const n=Number(raw); if(n>20000&&n<80000) return fmt(new Date(Date.UTC(1899,11,30)+n*86400000)); } const d=new Date(raw); return isNaN(d.getTime())?null:fmt(d); }
function decadeOf(date){ const y=Number(date.slice(-4)); if(y<2000)return'1990s'; if(y<2010)return'2000s'; if(y<2020)return'2010s'; return'2020s'; }
function parseRating(raw){ if(!raw) return null; const m=String(raw).match(/-?\d+(\.\d+)?/); if(!m) return null; let n=Number(m[0]); if(n<=1&&n>0) n*=10; if(n>10&&n<=100) n/=10; return Math.max(0,Math.min(10,Math.round(n*10)/10)); }
function parseHotPick(raw){ return ['y','yes','true','1','x','✓','hot'].includes(String(raw).trim().toLowerCase()); }

const seenIds = new Set();
const reviews = [];
let skipped = 0;
rows.forEach((row, i) => {
  const artist = String(row['Artist']||'').trim();
  const album = String(row['Album']||'').trim();
  if (!artist || !album) { skipped++; return; }
  const date = parseDate(String(row['Review Date']||'')) ?? '01.01.1996';
  const score = parseRating(row['Rating']) ?? 0;
  const hot = parseHotPick(row['Hot Pick']);
  const text = String(row['Review Text']||'').trim();
  const body = text ? text.split(/\n\s*\n|\r\n\r\n/).map(p=>p.trim()).filter(Boolean) : ['(No review text imported.)'];
  let id = slugify(`${artist}-${album}`);
  let n = 2;
  while (seenIds.has(id)) { id = slugify(`${artist}-${album}-${n++}`); }
  seenIds.add(id);
  reviews.push({
    id, slug: id, title: album, artist,
    label: String(row['Label']||'—').trim() || '—',
    format: 'CD',
    genre: String(row['Period']||'Uncategorized').trim() || 'Uncategorized',
    date, decade: decadeOf(date),
    kind: hot ? 'bnm' : 'review',
    score,
    art: ART_POOL[i % ART_POOL.length],
    byline: String(row['Reviewer']||'').trim() || 'Staff',
    readMins: Math.max(2, Math.round(body.join(' ').split(/\s+/).length/220)),
    body,
    status: 'draft',
    labelAddress: String(row['Label Address']||'').trim() || undefined,
    contact: String(row['Contact']||'').trim() || undefined,
    archiveUrl: String(row['Archive URL']||'').trim() || undefined,
    period: String(row['Period']||'').trim() || undefined,
  });
});

const out = `// Auto-generated from listone.xlsx. ${reviews.length} legacy reviews imported as drafts.
import type { Review } from "./cd-data";

export const IMPORTED_REVIEWS: Review[] = ${JSON.stringify(reviews, null, 2)};
`;
writeFileSync('src/lib/cd-imported-reviews.ts', out);
console.log(`wrote ${reviews.length} reviews, skipped ${skipped}`);
